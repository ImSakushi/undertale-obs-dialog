using System;
using System.Collections.Generic;
using System.IO;
using UndertaleModLib;
using UndertaleModLib.Models;
using UndertaleModLib.Util;

EnsureDataLoaded();

string outputDirectory = Environment.GetEnvironmentVariable("UTDR_VOICE_OUTPUT");
string requestedNames = Environment.GetEnvironmentVariable("UTDR_VOICE_NAMES");

if (String.IsNullOrWhiteSpace(outputDirectory) || String.IsNullOrWhiteSpace(requestedNames))
{
    throw new ScriptException("UTDR_VOICE_OUTPUT and UTDR_VOICE_NAMES must be set.");
}

Directory.CreateDirectory(outputDirectory);

var wanted = new HashSet<string>(
    requestedNames.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
    StringComparer.OrdinalIgnoreCase
);
var exported = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
var loadedAudioGroups = new Dictionary<string, IList<UndertaleEmbeddedAudio>>(StringComparer.OrdinalIgnoreCase);

const string defaultAudioGroupName = "audiogroup_default";
byte[] emptyWav = Convert.FromBase64String("UklGRiQAAABXQVZFZm10IBAAAAABAAIAQB8AAAB9AAAEABAAZGF0YQAAAAA=");

IList<UndertaleEmbeddedAudio> GetAudioGroupData(UndertaleSound sound)
{
    string audioGroupName = sound.AudioGroup is not null
        ? sound.AudioGroup.Name.Content
        : defaultAudioGroupName;

    if (loadedAudioGroups.TryGetValue(audioGroupName, out var cached))
    {
        return cached;
    }

    string relativePath = sound.AudioGroup is UndertaleAudioGroup { Path.Content: string customPath }
        ? customPath
        : $"audiogroup{sound.GroupID}.dat";
    string groupPath = Paths.JoinVerifyWithinDirectory(Path.GetDirectoryName(FilePath), relativePath);
    if (!File.Exists(groupPath))
    {
        return null;
    }

    using var stream = new FileStream(groupPath, FileMode.Open, FileAccess.Read);
    var groupData = UndertaleIO.Read(stream, (warning, _) => ScriptWarning(warning));
    loadedAudioGroups[audioGroupName] = groupData.EmbeddedAudio;
    return groupData.EmbeddedAudio;
}

byte[] GetEmbeddedData(UndertaleSound sound)
{
    if (sound.AudioFile is not null)
    {
        return sound.AudioFile.Data;
    }

    if (sound.GroupID > Data.GetBuiltinSoundGroupID())
    {
        var group = GetAudioGroupData(sound);
        if (group is not null && sound.AudioID >= 0 && sound.AudioID < group.Count)
        {
            return group[sound.AudioID].Data;
        }
    }

    return emptyWav;
}

foreach (UndertaleSound sound in Data.Sounds)
{
    if (sound is null || !wanted.Contains(sound.Name.Content))
    {
        continue;
    }

    string name = sound.Name.Content;
    bool compressed = sound.Flags.HasFlag(UndertaleSound.AudioEntryFlags.IsCompressed);
    bool embedded = sound.Flags.HasFlag(UndertaleSound.AudioEntryFlags.IsEmbedded);
    string extension = embedded && !compressed ? ".wav" : ".ogg";
    string destination = Paths.JoinVerifyWithinDirectory(outputDirectory, name + extension);

    if (!compressed && !embedded)
    {
        string externalName = sound.File.Content;
        if (!Path.HasExtension(externalName))
        {
            externalName += ".ogg";
        }
        string source = Paths.JoinVerifyWithinDirectory(Path.GetDirectoryName(FilePath), externalName);
        File.Copy(source, destination, true);
    }
    else
    {
        File.WriteAllBytes(destination, GetEmbeddedData(sound));
    }

    exported.Add(name);
    ScriptMessage($"Exported {name}{extension}");
}

wanted.ExceptWith(exported);
if (wanted.Count > 0)
{
    throw new ScriptException("Missing sounds: " + String.Join(", ", wanted));
}
