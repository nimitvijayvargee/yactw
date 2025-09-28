/* Init Functions */
function showTerminal() {
  document.getElementById("desktop-normal").style.display = "none";
  document.getElementById("desktop-terminal").style.display = "block";
  output.innerHTML = `
    <span class="comment">// hi</span> <br />
    <span class="user" id="user"></span>:<span class="path">~</span>$ yactw.sh<br /><br />
  `;
  spawnTitle();
  getURL();
  setTimeout(getUserIP, 400);
  setTimeout(getSystemInfo, 800);
  setTimeout(welcomeUser, 1200);
  setTimeout(startCMDLine, 1400);
}
function getURL() {
  const url = location.host;
  console.log("URL:", url);

  const formattedURL = url
    .replace(/^https?:\/\//, "")
    .replace("/site/", "")
    .replace("index.html", "");

  createLabel("url", "Access point", formattedURL);
  document.getElementById("user").innerText = `user@${formattedURL}`;
  return formattedURL;
}
function createLabel(id, label, info) {
  const table = document.getElementById("labels");
  const row = document.createElement("tr");

  const cellLabel = document.createElement("td");
  cellLabel.className = "infolabel";
  cellLabel.innerText = `${label}`;

  const cellColon = document.createElement("td");
  cellColon.className = "colon";
  cellColon.innerText = " : ";

  const cellInfo = document.createElement("td");
  cellInfo.className = "info";
  cellInfo.id = id;
  cellInfo.innerText = info;

  row.appendChild(cellLabel);
  row.appendChild(cellColon);
  row.appendChild(cellInfo);
  table.appendChild(row);

  console.log(table);
  return cellLabel, cellInfo;
}
function getUserIP() {

  fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(data => {
      console.log("IP Address (IPv4): ", data.ip);
      createLabel("ip4", "Remote Client IPv4", data.ip);
    });

  fetch("https://api64.ipify.org?format=json")
    .then(res => res.json())
    .then(data => {
      console.log("IP Address (IPv6): ", data.ip);
      createLabel("ip6", "Remote Client IPv6", data.ip);
    });
}
function getSystemInfo() {
  const userAgent = navigator.userAgent;
  let os = "Unknown", osVersion = "";

  if (/Windows NT/.test(userAgent)) {
    os = "Windows NT";
    osVersion = (userAgent.match(/Windows NT ([\d.]+)/) || [])[1] || "";
  } else if (/Mac OS X/.test(userAgent)) {
    os = "MacOS";
    osVersion = ((userAgent.match(/Mac OS X ([\d_]+)/) || [])[1] || "").replace(/_/g, ".");
  } else if (/Android/.test(userAgent)) {
    os = "Android";
    osVersion = (userAgent.match(/Android ([\d.]+)/) || [])[1] || "";
  } else if (/like Mac/.test(userAgent)) {
    os = "iOS";
    osVersion = ((userAgent.match(/OS ([\d_]+) like Mac OS X/) || [])[1] || "").replace(/_/g, ".");
  } else if (/Linux/.test(userAgent)) {
    os = "Linux";
  }
  createLabel("os", "Remote Client OS", `${os}${osVersion}`);
  createLabel("memory", "Device Memory", `${navigator.deviceMemory || "Unknown"} GB`);
  createLabel("cores", "CPU Cores", `${navigator.hardwareConcurrency || "Unknown"}`);
  createLabel("timezone", "Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase() || "Unknown");
  let cpuArch = "Unknown";
  if (/arm|aarch64/i.test(userAgent)) cpuArch = "ARM";
  else if (/x86_64|Win64|WOW64|amd64/i.test(userAgent)) cpuArch = "x86_64";
  else if (/i686|i386|x86/i.test(userAgent)) cpuArch = "x86";
  else if (/PPC|PowerPC/i.test(userAgent)) cpuArch = "PowerPC";
  else if (/MIPS/i.test(userAgent)) cpuArch = "MIPS";

  createLabel("cpu", "CPU ", cpuArch);

}
function welcomeUser() {
  document.getElementById("welcome").innerHTML = `
    welcome to nimit's homepage! <br/>
    run a command to get started <br/>
    use \`help\` for a list of commands <br/> run \`exit\` to return to the normal site <br/><br/>
  `;
}
function startCMDLine() {
  document.getElementById("input").innerHTML = `
    <div class="inputline">
      <span class="user" id="user">user@${location.host}</span>:<span class="path" id="inputpath">~${currentStringPath}</span>$
      <span id="cmdline" contenteditable="true"></span>
      <span class="blinking-cursor">|</span>
    </div>`;
}
function spawnTitle() {
  output.innerHTML += `
              <span id="yactwtitle">yactw - yet another corny terminal website</span><br />\
              <table id="labels"></table>
              <div id="welcome"></div>
  `;
  console.log(output.innerHTML)
}
/* Command Functions */
function parseCMD(cmd) {
  const commands = {
    "help": () => { help(); },
    "ls": () => { listFiles(); },
    "clear": () => { clearScreen(); },
    "about": () => { aboutMe(); }
  }
}
commands = ["help", "ls", "clear", "about", "cat", "cd", "toggle-overlay", "exit", "git"];
function failedCMD(cmd, reason = "N/A") {
  let args = cmd.split(" ");
  cmd = args[0];
  args.pop(cmd);
  if (commands.includes(cmd)) {
    switch (cmd) {
      case "cat":
      case "cd":
        if (args.length === 0) {
          throwError(cmd, "no file/directory specified");
          console.log("no file/directory specified");
          return;
        }
        break;
      default:
        throwError(cmd, "invalid usage");
        console.log("invalid usage");
        return;
    }
    console.log("command failed to execute");
    throwError(cmd, reason);
  } else {
    if (reason === "N/A") {
      throwError(cmd, "command not found");
      return;
    } else {
      throwError(cmd, `command not found, error \`${reason}\``);
    }
    console.log(`command not found: ${cmd}. if you are lost, try \`help\``);
  }
}
function throwError(cmd, error) {
  console.log(`an error occurred while executing ${cmd}: ${error}`);
  const errorText = `command \`${cmd}\` failed to execute: ${error}`;
  const errorTextElement = document.createElement("span");
  errorTextElement.setAttribute("class", "error ");
  errorTextElement.innerText = errorText;
  output.appendChild(errorTextElement);
  output.appendChild(document.createElement("br"));
  return errorTextElement;
}
function appendHelpableCommand(cmd, desc) {
  const commandContainer = document.querySelector(".helpcmds:last-of-type");
  const cmdEntry = document.createElement("span");
  cmdEntry.className = "helpCMDEntry";
  cmdEntry.innerText = `${cmd}: `;

  const cmdDesc = document.createElement("span");
  cmdDesc.className = "helpCMDDesc";
  cmdDesc.id = "helpCMD" + cmd;
  cmdDesc.innerText = desc;

  commandContainer.appendChild(cmdEntry);
  commandContainer.appendChild(cmdDesc);
  commandContainer.appendChild(document.createElement("br"));
  console.log(commandContainer);
  return cmdEntry, cmdDesc;
}
/* Commands */
function help() {
  const helpText = `here is a list of currently usable commands and their descriptions`;
  const helpTextElement = document.createElement("span");
  helpTextElement.setAttribute("class", "helptext");
  helpTextElement.innerText = helpText;
  output.appendChild(helpTextElement);
  output.appendChild(document.createElement("br"));
  const commands = {
    "help": "display this help message",
    "ls [optional: directory]": "list available files in directory",
    "clear": "clear the terminal screen",
    "cat [file]": "display the contents of a file",
    "cd [directory]": "change the current directory",
    "toggle-overlay": "toggle the annoying overlay animation and filter",
    "exit": "close the connection and return to the normal site"
  };
  const commandContainer = document.createElement("div");
  commandContainer.setAttribute("class", "helpcmds");
  output.appendChild(commandContainer);
  Object.entries(commands).forEach(([cmd, desc]) => {
    appendHelpableCommand(cmd, desc);
  });
  return true;
}
function clear() {
  output.innerHTML = "";
  return true;
}
function ls(path = "") {
  var node = currentDirectory;
  if (path != "") {
    node = resolvePath(normalizePath(path));
  }
  const table = document.createElement("table");
  table.className = "lsTable";

  const header = document.createElement("tr");
  ["Created", "Type", "Name"].forEach(text => {
    const td = document.createElement("td");
    td.innerText = text;
    td.className = "lsHeader";
    header.appendChild(td);
  });
  table.appendChild(header);

  Object.entries(node.children).forEach(([filename, file]) => {
    const row = document.createElement("tr");
    row.className = file.type === "dir" ? "directory" : "file";

    const created = document.createElement("td");
    created.className = "fileCreated";
    created.innerText = (file.created || "----");

    const type = document.createElement("td");
    type.className = "fileType";
    type.innerText = file.type === "dir" ? "<dir>" : file.type;

    const name = document.createElement("td");
    name.className = "fileName";
    name.innerText = filename;

    row.appendChild(created);
    row.appendChild(type);
    row.appendChild(name);
    table.appendChild(row);
  });

  output.appendChild(table);
  return true;
}
function toggleOverlay() {
  const overlay = document.getElementById("overlay");
  if (overlay.style.display !== "none") {
    overlay.style.display = "none";
    console.log("overlay disabled");
    return true;
  } else {
    overlay.style.display = "initial";
    console.log("overlay enabled");
    return true;
  }
}
function cat(path) {
  const node = resolvePath(path);
  if (!node) {
    throwError("cat", `file \`${path}\` not found`);
    return false;
  }
  if (node.type === "dir") {
    throwError("cat", `\`${path}\` is a directory`);
    return false;
  }
  const span = document.createElement("span");
  span.className = "fileContent";
  span.innerHTML = node.content;
  output.appendChild(span);
  output.appendChild(document.createElement("br"));
  return true;
}
function cd(path) {
  if (path === ".." || path === "../") {
    if (currentDirectory.parent) {
      currentDirectory = currentDirectory.parent;
      currentStringPath = createPathString(currentDirectory);
      console.log(currentDirectory, currentStringPath);
      return true;
    } else {
      throwError("cd", "already at root directory");
      return true;
    }
  }
  if (path === "root/") {
    currentDirectory = fileTree;
    currentStringPath = createPathString(currentDirectory);
    console.log(currentDirectory, currentStringPath);
    return true;
  }

  const node = resolvePath(normalizePath(path));
  if (!node && !path.includes("root")) {
    throwError("cd", `directory \`${path}\` not found`);
    return true;
  } else if (!node && path.includes("root")) {
    throwError("cd", `invalid path \`${path}\`. did you mean \`root/\`?`);
    return true;
  }
  if (node.type !== "dir") {
    throwError("cd", `\`${path}\` is not a directory`);
    return true;
  }
  currentDirectory = node;
  currentStringPath = createPathString(currentDirectory);
  console.log(node, currentStringPath);
  return true;
}
function git() {
  const gitText = `
  git isn't a command here! but you might like the source code for this site! </br> 
  <a class="repoLink" href="https://github.com/nimitvijayvargee/yactw">View the source code</a> <br /> 
  Also check out my github while you're at it! <br /> 
  <a class="repoLink" href="https://github.com/nimitvijayvargee">nimitvijayvargee on GitHub</a>
  `;
  const gitTextElement = document.createElement("span");
  gitTextElement.setAttribute("class", "gittext");
  gitTextElement.innerHTML = gitText;
  output.appendChild(gitTextElement);
  output.appendChild(document.createElement("br"));
  return true;
}
function returnToNormalSite() {
  output.innerHTML += `<span id="exit">closing connection</span><br/>`;
  setTimeout(setExitDisplayStyle, 1500);

}
function setExitDisplayStyle() {
  document.getElementById("desktop-normal").style.display = "block";
  document.getElementById("desktop-terminal").style.display = "none";
}
/* Path and File Functions */
function createFile(name, type, created, isDirectory = false, content = "") {
  if (!isDirectory) {
    return {
      name: name,
      type: type,
      created: created,
      isDirectory: isDirectory,
      content: content
    };
  } else {  // Create a blank directory that needs to modified later thru files. Or just set it equal to another file structure, your choice tbh.
    return {
      name: name,
      type: type,
      created: created,
      isDirectory: isDirectory,
      content: []
    };
  }
}
function normalizePath(path) {
  return path
    .trim()
    .replace(/^[/\\]+/, "")
    .replace(/\\/g, "/");
}
function resolvePath(path) {
  const parts = normalizePath(path).split("/").filter(Boolean);
  let node = currentDirectory;

  for (let i = 0; i < parts.length; i++) {
    if (node.type !== "dir") return null;
    node = node.children[parts[i]];
    if (!node) return null;
  }

  return node;
}
function createPathString(node) {
  if (node === fileTree) return "";
  let path = "";
  while (node && node !== fileTree) {
    path = `/${node.name}` + path;
    node = node.parent;
  }
  console.log("Current path:", path);
  return path;
}
/* Filesystem */
const deskrgbm_txt = `
deskRGBM (Desktop RGB matrix) is a cool ornamental side project I made for hackclub highway! this project was made to be a fun little toy that can connect to a computer and use Vial (yes, the keyboard app) to control cool effects on a small 8x8 RGB Matrix. There is also a singular rotary encoder you can use to cycle the colours, effects, brightness and speed. This project was a small, easy to follow PCB project. It also helped to learn to solder SMD components (somewhat), and I really enjoyed making this one! <br/> <a href="https://github.com/nimitvijayvargee/deskrgbm" class="repoLink">Visit the repo!</a>
`
const deskthing_txt = `
deskthing is my take on a Spotify car thing clone built for your desk! I made it because I use my phone while studying and listening to music, but it gets a bit distracting and annoying. I am still working on getting the software for this optimized, but hope to have everything be controllable with a single rotary encoder. this project was made for hackclub highway and I thank them for funding this idea!<br/> <a href="https://github.com/nimitvijayvargee/deskthing" class="repoLink">Visit the repo!</a>
`
const mateingreen_txt = `
MateInGreen is a random chessbot I made using python that uses the basic minimax algorithm to play chess! it works, albeit not that good. it can make moves, castle and so on. it's built with pygame to render the board so you can play with the bot as well, rather than typing your commands into the terminal! I later inplemented alpha-beta pruning in order to drastically speed up the bot, although the depth is still quite less. <br/> <a href="https://github.com/nimitvijayvargee/MateInGreen" class="repoLinkWS">Visit the repo!</a>
`
const keyboardv2_txt = `
keyboardv2 is the second iteration of my custom 75% mechanical keyboard built on the RP2040, although it is the only one that actually went into manfacturing. the keyboard itself consists of a standard 75ANSI layout with staggered keys. it has an RGB matrix, a rotary encoder and complete vial support. <br/> <a href="https://github.com/nimitvijayvargee/keyboardv2" class="repoLink">Visit the repo!</a>
`
const yactw_txt = `
This site! Yet another corny terminal website is a random site I made for fun with vanilla JS, HTML and CSS. It is merely meant to give life to this domain which I haven't used in the year since I bought it last August.
`
const about_txt = `
This website is nimit's corner of the internet! I am nimit, and I made this website to share some of my work with the world. sure, github works but formatting a resume into markdown is not fun at all. I am a 16 year old tech lover from india! I make some cool shit here and there, and sometimes my projects even work. I find myself working with hardware time and time again, and I love to spend my time doing circuit design, often times for fun. I have made tens of PCBs, and even manufactured a couple! some of my notable projects include keyboardv2, this website and I am currently working on a project that can be used as a USB tool to connect to computers and steal data (educationally). you can read more about my individual projects with \`cat \\projects\\[project]\`. I hope to remember to update this website frequently and would love to see you around!
`
const fileTree = {
  type: "dir",
  children: {
    "yactw.sh": { name: "yactw.sh", type: "shell", created: "2025-09-07", content: "" },
    "about.txt": { name: "about.txt", type: "text", created: "2024-09-07", content: about_txt },
    "projects": {
      name: "projects",
      type: "dir",
      created: "2024-09-07",
      children: {
        "deskrgbm.txt": { name: "deskrgbm.txt", type: "text", created: "2024-09-10", content: deskrgbm_txt },
        "deskthing.txt": { name: "deskthing.txt", type: "text", created: "2024-09-10", content: deskthing_txt },
        "mateingreen.txt": { name: "mateingreen.txt", type: "text", created: "2024-09-10", content: mateingreen_txt },
        "keyboardv2.txt": { name: "keyboardv2.txt", type: "text", created: "2024-09-10", content: keyboardv2_txt },
        "yactw.txt": { name: "yactw.txt", type: "text", created: "2024-09-10", content: yactw_txt }
      }
    }
  }
};

/* Init + Keystrokes */
startKeylogger();
const output = document.getElementById("output");
let recorded = "";
let commandHistory = [];
let historyParseIndex = 0;
let currentDirectory = fileTree; // Root
let currentStringPath = createPathString(currentDirectory);

function startKeylogger() {
  document.addEventListener("keydown", e => {
    if (e.key.length === 1) {
      recorded += e.key;
      console.log(`[+${e.key}] ${recorded}`);
    } else if (e.key === "Backspace") {
      recorded = recorded.slice(0, -1);
      console.log(`[-bks] ${recorded}`);
    } else if (e.key === "ArrowUp") {
      scrollTo(0, document.body.scrollHeight);
      if (historyParseIndex > 0) {
        historyParseIndex--;
        let currently_typed = recorded;
        recorded = commandHistory[historyParseIndex];
        commandHistory.push(currently_typed);
        console.log(`[UP] ${recorded}`);
        commandHistory = [...new Set(commandHistory)];
      }
    } else if (e.key === "ArrowDown") {
      scrollTo(0, document.body.scrollHeight);
      if (historyParseIndex < commandHistory.length - 1) {
        historyParseIndex++;
        recorded = commandHistory[historyParseIndex];
        console.log(`[DOWN] ${recorded}`);
        commandHistory = [...new Set(commandHistory)];
        commandHistory.pop("");
        commandHistory.push("");
      }
    } else if (e.key === "Enter") {
      console.log(`[ENTER] Command run: ${recorded}`);
      output.innerHTML += `
    <div class="inputline">
      <span class="user" id="user">user@${location.host}</span>:<span class="path">~${currentStringPath}</span>$
      <span class="cmdline">${recorded}</span>
    </div>`;
      commandHistory.push(recorded);
      historyParseIndex = commandHistory.length;
      switch (recorded.toLowerCase()) {
        case "yactw.sh":
          try {
            if (yactwsh()) {
              recorded = "";
              break;
            } else {
              recorded = "";
              failedCMD(recorded);
              console.log("this is embarrassing, contact me if you see this because the website failed to initialize");
            }
          } catch (e) {
            console.error(e);
            failedCMD(recorded);
            recorded = "";
          }
          break;
        case "help":
          try {
            if (help()) {
              recorded = "";
              break;
            } else {
              failedCMD(recorded);
              recorded = "";
            }
          } catch (e) {
            console.error(e);
            failedCMD(recorded);
            recorded = "";
          }
          break;
        case (recorded.toLowerCase().startsWith("ls") ? recorded : null):
          try {
            const parts = recorded.split(" ");
            if (!parts[1]) {
              parts[1] = "";
            }
            const path = normalizePath(parts[1]);

            if (ls(path)) {
              recorded = "";
              break;
            } else {
              failedCMD(recorded);
              recorded = "";
            }
          } catch (e) {
            console.error(e);
            failedCMD(recorded);
            recorded = "";
          }
          break;
        case "ls":
          try {
            if (ls()) {
              recorded = "";
              break;
            } else {
              failedCMD(recorded);
              recorded = "";
            }
          } catch (e) {
            console.error(e);
            failedCMD(recorded);
            recorded = "";
          }
          break;
        case "clear":
          try {
            if (clear()) {
              recorded = "";
              break;
            } else {
              failedCMD(recorded);
              recorded = "";
            }
          } catch (e) {
            console.error(e);
            failedCMD(recorded);
            recorded = "";
          }
          break;
        case "about":
          try {
            if (about()) {
              recorded = "";
              break;
            } else {
              failedCMD(recorded);
              recorded = "";
            }
          } catch (e) {
            console.error(e);
            failedCMD(recorded);
            recorded = "";
          }
          break;
        case "toggle-overlay":
          try {
            if (toggleOverlay()) {
              recorded = "";
              break;
            } else {
              failedCMD(recorded);
              recorded = "";
            }
          } catch (e) {
            console.error(e);
            failedCMD(recorded);
            recorded = "";
          }
          break;
        case (recorded.startsWith("cat") ? recorded : null):
          try {
            const parts = recorded.split(" ");
            const filename = normalizePath(parts[1]);

            if (cat(filename)) {
              recorded = "";
              break;
            } else {
              failedCMD(recorded);
              recorded = "";
            }
          } catch (e) {
            console.error(e);
            failedCMD(recorded);
            recorded = "";
          }
          break;
        case "cat":
          throwError("cat", "no file specified");
          recorded = "";
          break;
        case (recorded.startsWith("cd") ? recorded : null):
          try {
            const parts = recorded.split(" ");
            const path = normalizePath(parts[1]);
            if (cd(path)) {
              recorded = "";
              break;
            } else {
              failedCMD(recorded);
              recorded = "";
            }
          } catch (e) {
            console.error(e);
            failedCMD(recorded);
            recorded = "";
          }
          break;
        case "exit":
          returnToNormalSite();
          break
        case "git":
          try {
            if (git()) {
              recorded = "";
              break;
            } else {
              failedCMD(recorded);
              recorded = "";
            }
          } catch (e) {
            console.error(e);
            failedCMD(recorded);
            recorded = "";
          }
          break;
        case "": recorded = ""; break;
        default: failedCMD(recorded); recorded = ""; break;
      }
      scrollTo(0, document.body.scrollHeight);
    }
    document.getElementById("cmdline").innerText = recorded.replace(/ /g, "\u00a0");
    document.getElementById("inputpath").innerText = `~${currentStringPath}`;
  });
}

/* Tabs */
function openTab(Name) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  var projectsContainer = document.getElementById('projectsContainer');
  if (projectsContainer) projectsContainer.style.display = 'none';

  var aboutContainer = document.getElementById('aboutContainer');
  if (aboutContainer) aboutContainer.style.display = 'none';

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(Name).style.display = "block";

  for (i = 0; i < tablinks.length; i++) {
    var onclickAttr = tablinks[i].getAttribute("onclick") || "";
    if (onclickAttr.indexOf("openTab('" + Name + "')") !== -1) {
      tablinks[i].className += " active";
      break;
    }
  }

  if (Name === 'projects' && projectsContainer) projectsContainer.style.display = 'block';
  if (Name === 'about' && aboutContainer) aboutContainer.style.display = 'block';
}


function openProjectTab(Name) {
  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontentProject");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinksProject");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(Name).style.display = "block";
  var btn = document.getElementById(Name + "-btn");
  if (btn) btn.className += " active";
}

if (window.innerWidth <= 768) {
  document.getElementById("desktop-normal").innerHTML = ``
  document.getElementById("desktop-terminal").innerHTML = ``
}
if (window.innerWidth > 768) {
  document.getElementById("mobile-selection").innerHTML = ``
  document.getElementById("mobile").innerHTML = ``
}

window.addEventListener('resize', function () {
  if (window.innerWidth <= 768 && document.getElementById("mobile").innerHTML === ``) this.window.location.reload();
  if (window.innerWidth > 768 && document.getElementById("desktop-normal").innerHTML === ``) this.window.location.reload();
});
