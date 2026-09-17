# ZeroInfra Labs Manual

## Welcome

Welcome to the first hacking simulator that runs right in your browser!

This short guide explains the basic features of the simulator. Let's take a look at the tools you'll use during your missions.

---

## 1. The desktop

When you enter any lab, a Kali Linux-style desktop loads with:

- **Terminal** (`>_` icon): your main console, always open when you start.
- **Manual** (PDF document icon): this guide, open alongside the terminal.
- **Wallpapers** (image icon): opens the wallpaper picker.
- **Chrome** (browser icon): only appears in web labs, to interact with the vulnerable applications.

On the top bar (taskbar) you have:

- The **Applications** menu (`K` letter) with quick access to Terminal, Change Wallpaper, View Manual, and Chrome.
- Buttons for all open windows (click to minimize, restore, or bring to front).
- The clock, the network status, and the **power off** button to exit the lab.

All windows can be **moved** (by dragging the title bar) and **resized**: drag the **edges** (top, bottom, left, or right) or the **corners** to adjust the size. You can also **minimize**, **maximize**, and **close** them from the title bar buttons.

---

## 2. The terminal

It's the heart of the simulator: this is where you type all your pentesting commands.

### How to use it

- Type the command and press **Enter**.
- Basic navigation: `ls`, `cd`, `cat`, `pwd`, `echo`, etc. work like in real Linux.
- Browse your command history with the ↑/↓ arrow keys.
- You can use **redirections** (`>`, `>>`, `<`) and **pipes** (`|`), for example: `cat file.txt | grep flag`.

### Settings

Each terminal has a settings menu (gear icon in the window bar) where you can change:

- **Font size** (from 10 to 20 px).
- Window **opacity**.
- **Text color** of the prompt.

### Number of terminals

You can have up to **5 terminals** open at the same time. Use the `+` button on the top bar or the **Applications → Open Terminal** menu.

### Command help

Type `help` in any terminal to see the full list of available commands. You can also check a specific command:

```
help <command>
```

> **Important: it's a simulation**
> This simulator does **not** implement every command of a real system, and the existing commands do **not** support all of their parameters (only the ones needed for the missions). The goal is educational: learn the *flow* of pentesting (enumeration → scanning → exploitation → post-exploitation), not the exhaustive syntax of each tool.

---

## 3. The browser

In web labs you'll find the **Chrome** icon on the desktop. The simulator's browser works like a real one:

- Address bar to type URLs (e.g.: `http://<ip>/login`).
- **Simulated web pages** that reproduce vulnerable applications (login, admin panels, WordPress blogs, directories with sensitive files, etc.).
- Navigation buttons (back / forward / reload) and tabs.

It's a complementary tool: many lab hints require **looking at the website** to find credentials, paths, or hidden features that you'll later use in the terminal.

---

## 4. Mission guide menu (Missions)

The **right side panel** shows the lab's mission list. Each mission represents a concrete step of the attack and has:

- The **objective** (enumeration, scanning, exploitation, etc.).
- A status bar: **active / pending / completed**.
- Hints: a button to reveal the next hint when you get stuck. There are up to 2 hints per mission.

The mission is **completed automatically** when you run the correct command (the simulator detects the action and validates the step). Follow the order of the missions to progress logically.

---

## 5. Network topology and enumeration

- **Network map** (network icon in the panel): shows the discovered machines and their status. As you progress, hosts detected with `arp-scan`, `netdiscover`, or `nmap` are added.
- **Enumeration panel**: records the results of your reconnaissance — open ports, detected services, found credentials, and confirmed vulnerabilities.

These panels are your "automatic notebook": you don't need to memorize IPs or credentials because the simulator stores them there as you discover them. Confirmed credentials are marked as **VERIFIED** when the service checks that they are valid.

---

## 6. Wallpapers and customization

From the **Wallpapers** icon (image icon) on the desktop or **Applications → Change Wallpaper** you can open the wallpaper picker. You can choose from several designs, and your choice **is saved** for the next time you open the simulator.

You can also customize the terminal (text color, opacity, and font size) from the settings menu of each window.

---

Enjoy the lab and happy hacking!
