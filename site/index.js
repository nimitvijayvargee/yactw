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
      createLabel("ip", "Remote Client IPv4", data.ip);
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
    use \`help\` for a list of commands <br/>`;
}

function startCMDLine() {
  document.getElementById("input").innerHTML = `
    <div class="inputline">
      <span class="user" id="user">user@${location.host}</span>:<span class="tilde">~</span>$
      <span id="cmdline" contenteditable="true"></span>
      <span class="blinking-cursor">|</span>
    </div>`;
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

commands = ["help", "ls", "clear", "about", "cat"];
function failedCMD(cmd, reason = "N/A") {
  let args = cmd.split(" ");
  cmd = args[0];
  args.pop(cmd);
  if (commands.includes(cmd)) {
    switch (cmd) {
      case "cat":
        if (args.length === 0) {
          throwError(cmd, "no file specified");
          console.log("no file specified");
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

/* Commands */
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

function help() {
  const helpText = `here is a list of currently usable commands and their descriptions`;
  const helpTextElement = document.createElement("span");
  helpTextElement.setAttribute("class", "helptext");
  helpTextElement.innerText = helpText;
  output.appendChild(helpTextElement);
  output.appendChild(document.createElement("br"));
  const commands = {
    "help": "display this help message",
    "ls": "list available files",
    "clear": "clear the terminal screen",
    "about": "learn more about me",
    "toggle-overlay": "toggle the annoying overlay animation and filter",
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
function ls() {
  const table = document.createElement("table");
  table.className = "lsTable";
  const header = document.createElement("tr");
  ["Created", "Type", "Name"].forEach(text => {
    const td = document.createElement("td");
    td.innerText = text;
    header.appendChild(td);
  });
  table.appendChild(header);

  Object.entries(files).forEach(([filename, file]) => {
    const row = document.createElement("tr");
    row.className = file.isDirectory ? "directory" : "file";

    const created = document.createElement("td");
    created.className = "fileCreated";
    created.innerText = file.created + ".....";

    const type = document.createElement("td");
    type.className = "fileType";
    type.innerText = file.isDirectory ? "<dir>" : file.type;
    type.innerText += 10 - file.type.length <= 0 ? "" : ".".repeat(10 - file.type.length);

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
  span.innerText = node.content;
  output.appendChild(span);
  output.appendChild(document.createElement("br"));
  return true;
}

function ls(path = "") {
  const node = path ? resolvePath(path) : fileTree;
  if (!node) {
    throwError("ls", `path \`${path}\` not found`);
    return false;
  }
  if (node.type === "file") {
    throwError("ls", `\`${path}\` is not a directory`);
    return false;
  }

  const table = document.createElement("table");
  table.className = "lsTable";
  const header = document.createElement("tr");
  ["Created", "Type", "Name"].forEach(text => {
    const td = document.createElement("td");
    td.innerText = text;
    td.className = "lsHeader"
    header.appendChild(td);
  });
  table.appendChild(header);

  Object.entries(node.children).forEach(([name, child]) => {
    const row = document.createElement("tr");
    row.className = child.type === "dir" ? "directory" : "file";

    const created = document.createElement("td");
    created.className = "fileCreated";
    created.innerText = (child.created || "----");

    const type = document.createElement("td");
    type.className = "fileType";
    type.innerText = child.type === "dir" ? "<dir>" : child.type;

    const fname = document.createElement("td");
    fname.className = "fileName";
    fname.innerText = name;

    row.appendChild(created);
    row.appendChild(type);
    row.appendChild(fname);
    table.appendChild(row);
  });

  output.appendChild(table);
  return true;
}



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
  let node = fileTree;

  for (let i = 0; i < parts.length; i++) {
    if (node.type !== "dir") return null;
    node = node.children[parts[i]];
    if (!node) return null;
  }

  return node;
}



// Projects Directory
const deskrgbm_txt = `
deskRGBM (Desktop RGB matrix) is a cool ornamental side project I made for hackclub highway! this project was made to be a fun little toy that can connect to a computer and use Vial (yes, the keyboard app) to control cool effects on a small 8x8 RGB Matrix. There is also a singular rotary encoder you can use to cycle the colours, effects, brightness and speed. This project was a small, easy to follow PCB project. It also helped to learn to solder SMD components (somewhat), and I really enjoyed making this one!
`
const about_txt = `
This website is nimit's corner of the internet! i am nimit, and i made this website to share some of my work with the world. sure, github works but formatting a resume into markdown is not fun at all. i am a 16 year old tech lover from india! i make some cool shit here and there, and sometimes my projects even work. i find myself working with hardware time and time again, and i love to spend my time doing circuit design, often times for fun. i have made tens of PCBs, and even manufactured a couple! some of my notable projects include keyboardv2, this website and i am currently working on a project that can be used as a USB tool to connect to computers and steal data (educationally). you can read more about my individual projects with \`cat \\projects\\[project]\`. i hope to remember to update this website frequently and would love to see you around!
`
const fileTree = {
  type: "dir",
  children: {
    "yactw.sh": { type: "shell", created: "2025-09-07", content: "" },
    "about.txt": { type: "text", created: "2024-09-07", content: about_txt },
    "projects": {
      type: "dir",
      created: "2024-09-07",
      children: {
        "deskrgbm.txt": { type: "text", created: "2024-09-10", content: deskrgbm_txt },
        "deskthing.txt": { type: "text", created: "2024-09-10", content: "" },
        "mateingreen.txt": { type: "text", created: "2024-09-10", content: "" },
        "keyboardv2.txt": { type: "text", created: "2024-09-10", content: "" },
        "yactw.txt": { type: "text", created: "2024-09-10", content: "" }
      }
    }
  }
};


/* Init + Keystrokes */
getURL();
getUserIP();
getSystemInfo();
setTimeout(welcomeUser, 1200);
setTimeout(startCMDLine, 1400);


const output = document.getElementById("output");
let recorded = "";
let commandHistory = [];
let historyParseIndex = 0;
let current_directory = ""; // Root


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
      <span class="user" id="user">user@${location.host}</span>:<span class="tilde">~</span>$
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
          console.log(e);
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
          console.log(e);
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
          console.log(e);
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
          console.log(e);
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
          console.log(e);
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
          console.log(e);
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
          console.log(e);
          failedCMD(recorded);
          recorded = "";
        }
        break;
      case (recorded.startsWith("cat") ? recorded : null):
        try {
          const parts = recorded.split(" ");
          const filename = normalizePath(parts[1]);  // <-- normalize here

          if (cat(filename)) {
            recorded = "";
            break;
          } else {
            failedCMD(recorded);
            recorded = "";
          }
        } catch (e) {
          console.log(e);
          failedCMD(recorded);
          recorded = "";
        }
        break;
      case "cat":
        throwError("cat", "no file specified");
        recorded = "";
        break;
      case "": recorded = ""; break;
      default: failedCMD(recorded); recorded = ""; break;
    }
    scrollTo(0, document.body.scrollHeight);

  }
  document.getElementById("cmdline").innerText = recorded.replace(/ /g, "\u00a0");
});
