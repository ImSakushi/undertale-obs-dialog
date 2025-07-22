# Undertale Dialogue Generator (for OBS)

This project allows you to display *Undertale*-style dialogues in OBS using a **Browser Source**, with a **control panel** to manage emotions and the dialogue queue.

<img width="578" height="152" alt="image" src="https://github.com/user-attachments/assets/10898322-e824-4012-91e8-68ef0dda1182" />

---

## 🚀 Installation

### 1. Clone the project

```bash
git clone https://github.com/ImSakushi/undertale-obs-dialog.git
cd undertale-obs-dialog
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
npm start
```

This will start the local server at `http://localhost:3000`.

---

## 🎥 Integrating with OBS

1. **Add a "Browser" source in OBS**
2. Give the source a name (e.g., `UndertaleDialogue`)
3. In the URL field, enter:

```
http://localhost:3000/display.html
```

4. Set the **width to 1920** and **height to 1080** (or adjust as needed)
5. Check "Transparent background" if desired

> 💡 You can move and resize the dialogue box freely within OBS.

---

## 🕹️ Using the Control Panel

Open the following address in your browser:

```
http://localhost:3000/control.html
```

From this interface, you can:

* Choose an **emotion** (Sans image)
* Write a **dialogue line**
* **Add it to the queue**
* Go to the **next line** (`Next`)
* **Pause** / **resume** the flow
* **Clear** the entire queue
* Delete individual lines

---

## 🧠 Keyboard Shortcuts

* On OBS (or `display.html`):

  * Press the `&` key (key 1 on AZERTY keyboards) to skip to the next dialogue line.

---

## 📁 Project Structure

```text
utdialogtest/
├── public/
│   ├── control.html     # Control panel for managing dialogues
│   ├── display.html     # Display page for OBS
│   ├── *.png            # Emotion images of Sans
│   ├── voice_sans.mp3   # Sound effect for each character
│   └── sans.woff2       # Undertale-style pixel font
├── server.js            # Node.js server (Express + Socket.io)
└── package.json         # Project configuration
```

## 🛠️ Dependencies

* [express](https://www.npmjs.com/package/express)
* [socket.io](https://www.npmjs.com/package/socket.io)
