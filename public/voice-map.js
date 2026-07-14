(function exposeCanonicalVoices(global) {
  const undertale = name => `/voices/undertale/${name}.wav`;
  const deltarune = name => `/voices/deltarune/${name}.wav`;
  const profile = (source, clips, options = {}) => Object.freeze({ source, clips, ...options });

  const profiles = Object.freeze({
    undertaleDefault: profile('SND_TXT1', [undertale('SND_TXT1')]),
    flowey: profile('snd_floweytalk1', [undertale('snd_floweytalk1')]),
    omegaFlowey: profile('snd_floweytalk2', [undertale('snd_floweytalk2')]),
    toriel: profile('snd_txttor', [undertale('snd_txttor')]),
    sans: profile('snd_txtsans', [undertale('snd_txtsans')]),
    papyrus: profile('snd_txtpap', [undertale('snd_txtpap')]),
    undyne: profile('snd_txtund', [undertale('snd_txtund')]),
    undyneUndying: profile('snd_txtund_hyper', [undertale('snd_txtund_hyper')]),
    alphys: profile('snd_txtal', [undertale('snd_txtal')]),
    asgore: profile('snd_txtasg', [undertale('snd_txtasg')]),
    asriel: profile('snd_txtasr', [undertale('snd_txtasr')]),
    asrielHyperdeath: profile('snd_txtasr2', [undertale('snd_txtasr2')]),
    mettaton: profile(
      'snd_mtt1..snd_mtt9',
      Array.from({ length: 9 }, (_, index) => undertale(`snd_mtt${index + 1}`))
    ),
    temmie: profile(
      'snd_tem..snd_tem6',
      [undertale('snd_tem'), ...Array.from({ length: 5 }, (_, index) => undertale(`snd_tem${index + 2}`))]
    ),
    gaster: profile(
      'snd_wngdng1..snd_wngdng7',
      Array.from({ length: 7 }, (_, index) => undertale(`snd_wngdng${index + 1}`))
    ),

    deltaruneDefault: profile('snd_text', [deltarune('snd_text')]),
    drToriel: profile('snd_txttor', [deltarune('snd_txttor')]),
    susie: profile('snd_txtsus', [deltarune('snd_txtsus')]),
    noelle: profile('snd_txtnoe', [deltarune('snd_txtnoe')]),
    berdly: profile('snd_txtber', [deltarune('snd_txtber')]),
    drSans: profile('snd_txtsans', [deltarune('snd_txtsans')]),
    drUndyne: profile('snd_txtund', [deltarune('snd_txtund')]),
    drAsgore: profile('snd_txtasg', [deltarune('snd_txtasg')]),
    drAlphys: profile('snd_txtal', [deltarune('snd_txtal')]),
    ralsei: profile('snd_txtral', [deltarune('snd_txtral')]),
    lancer: profile('snd_txtlan', [deltarune('snd_txtlan')]),
    king: profile('snd_dadtxt', [deltarune('snd_dadtxt')]),
    jevil: profile('snd_txtjok', [deltarune('snd_txtjok')]),
    rudy: profile('snd_txtrud', [deltarune('snd_txtrud')]),
    carol: profile('snd_txtcar', [deltarune('snd_txtcar')]),
    rouxls: profile('snd_txtrx1', [deltarune('snd_txtrx1')]),
    queen: profile('snd_txtq_2', [deltarune('snd_txtq_2')], { pitch: [0.9, 1.05] }),
    spamton: profile('snd_txtspam2', [deltarune('snd_txtspam2')], { pitch: [0.8, 1.2] }),
    tenna: profile(
      'snd_tv_voice_short..snd_tv_voice_short_9',
      [
        deltarune('snd_tv_voice_short'),
        ...Array.from({ length: 8 }, (_, index) => deltarune(`snd_tv_voice_short_${index + 2}`))
      ],
      { pitch: [0.86, 1.21], volume: 0.7 }
    )
  });

  // null signifie que le personnage est canoniquement muet ou ne parle jamais.
  const characters = Object.freeze({
    'undertale-frisk': null,
    'undertale-flowey': profiles.flowey,
    'undertale-toriel': profiles.toriel,
    'undertale-dummy': profiles.undertaleDefault,
    'undertale-napstablook': profiles.undertaleDefault,
    'undertale-sans': profiles.sans,
    'undertale-papyrus': profiles.papyrus,
    'undertale-grillby': null,
    'undertale-monsterkid': profiles.undertaleDefault,
    'undertale-maddummy': profiles.undertaleDefault,
    'undertale-undyne': profiles.undyne,
    'undertale-undyne-undying': profiles.undyneUndying,
    'undertale-temmie': profiles.temmie,
    'undertale-alphys': profiles.alphys,
    'undertale-mettaton': profiles.mettaton,
    'undertale-mad-mew-mew': profiles.undertaleDefault,
    'undertale-muffet': profiles.undertaleDefault,
    'undertale-mettaton-ex': profiles.mettaton,
    'undertale-mettaton-neo': profiles.mettaton,
    'undertale-asgore': profiles.asgore,
    'undertale-omega-flowey': profiles.omegaFlowey,
    'undertale-asriel': profiles.asriel,
    'undertale-hyperdeath-asriel': profiles.asrielHyperdeath,
    'undertale-final-form-asriel': profiles.asrielHyperdeath,
    'undertale-chara': null,
    'undertale-gaster': profiles.gaster,

    'deltarune-kris': null,
    'deltarune-kris-dw': null,
    'deltarune-susie': profiles.susie,
    'deltarune-susie-dw': profiles.susie,
    'deltarune-darkprince': profiles.ralsei,
    'deltarune-ralseidisguise': profiles.ralsei,
    'deltarune-ralsei': profiles.ralsei,
    'deltarune-noelle': profiles.noelle,
    'deltarune-noelle-dw': profiles.noelle,
    'deltarune-berdly': profiles.berdly,
    'deltarune-berdly-dw': profiles.berdly,
    'deltarune-jockington': profiles.deltaruneDefault,
    'deltarune-catti': profiles.deltaruneDefault,
    'deltarune-toriel': profiles.drToriel,
    'deltarune-asgore': profiles.drAsgore,
    'deltarune-alphys': profiles.drAlphys,
    'deltarune-undyne': profiles.drUndyne,
    'deltarune-rudy': profiles.rudy,
    'deltarune-carol': profiles.carol,
    'deltarune-catty': profiles.deltaruneDefault,
    'deltarune-bratty': profiles.deltaruneDefault,
    'deltarune-pizzapants': profiles.deltaruneDefault,
    'deltarune-lancer': profiles.lancer,
    'deltarune-rouxlskaard': profiles.rouxls,
    'deltarune-seam': profiles.deltaruneDefault,
    'deltarune-chaosking': profiles.king,
    'deltarune-jevil': profiles.jevil,
    'deltarune-queen': profiles.queen,
    'deltarune-spamton': profiles.spamton,
    'deltarune-tenna': profiles.tenna
  });

  function forDialogue(dialogue) {
    const character = String(dialogue?.character || '');
    if (Object.prototype.hasOwnProperty.call(characters, character)) {
      return characters[character];
    }
    if (!character && dialogue?.expr) {
      const expression = String(dialogue.expr).split('/').pop();
      return expression.startsWith('papyrus-') ? profiles.papyrus : profiles.sans;
    }
    if (dialogue?.universe === 'undertale') return profiles.undertaleDefault;
    if (dialogue?.universe === 'deltarune') return profiles.deltaruneDefault;
    return profiles.undertaleDefault;
  }

  global.UTDR_VOICES = Object.freeze({ characters, forDialogue, profiles });
})(window);
