/* ============================================================
   Content: command reference
   EDIT HERE to add or change commands shown in the Command explorer.
   ============================================================ */

// COMMAND REFERENCE. Each row: [command, purpose, risk (0 read-only, 1 changes state, 2 disruptive), permissions, how to read the result, related commands].
const CMD = [
    [
        "ipconfig /all", "Show full IP configuration for every adapter.", 0, "Standard", "Look at IPv4 address, mask, gateway, DHCP server and DNS servers. 169.254.x.x means DHCP failed.", "ping, nslookup, Get-NetIPConfiguration"
    ],
    [
        "ping <host>", "Test basic reachability and latency with ICMP.", 0, "Standard", "Replies prove the path works. Timeouts may also mean ICMP is blocked, so they are not proof of failure.", "tracert, Test-NetConnection"
    ],
    [
        "tracert <host>", "Show each routing hop to a destination.", 0, "Standard", "The last responding hop before timeouts marks where to look. Some routers hide hops.", "pathping, ping"
    ],
    [
        "nslookup <name> [server]", "Query DNS, optionally against a chosen server.", 0, "Standard", "Comparing answers from two servers shows whether the client setting or the server is wrong.", "Resolve-DnsName, ipconfig /flushdns"
    ],
    [
        "Resolve-DnsName <name>", "PowerShell DNS query returning structured records.", 0, "Standard", "Check Type, TTL and IPAddress. Add -Server to test a specific resolver.", "nslookup"
    ],
    [
        "Test-NetConnection <host> -Port 443", "Test a TCP port on a remote host.", 0, "Standard", "TcpTestSucceeded True means the port is reachable. False means blocked, closed or host down.", "ping, netstat"
    ],
    [
        "netstat -ano", "List connections and listening ports with process IDs.", 0, "Standard", "Match PID to tasklist to find which process owns a connection.", "tasklist, Get-Process"
    ],
    [
        "Get-NetAdapter", "List network adapters and link status.", 0, "Standard", "Status Up or Disconnected and LinkSpeed help separate hardware from configuration faults.", "ipconfig /all"
    ],
    [
        "whoami /groups", "Show the current user, groups and privilege level.", 0, "Standard", "Useful for access-denied cases: confirm the expected group appears. Group changes need a new sign-in.", "gpresult /r"
    ],
    [
        "gpresult /r", "Summarise Group Policy applied to user and computer.", 0, "Standard (/scope computer needs admin)", "Check which GPOs applied or were filtered, and the last applied time.", "gpupdate /force"
    ],
    [
        "Get-Service <name>", "Check whether a Windows service is running.", 0, "Standard", "Status Stopped on a required service explains many app faults.", "Restart-Service"
    ],
    [
        "Get-WinEvent -LogName System -MaxEvents 20", "Read recent System event log entries.", 0, "Standard (Security log needs admin)", "Look for Error or Critical entries near the incident time; record the Event ID.", "Event Viewer, Reliability Monitor"
    ],
    [
        "systeminfo", "Summarise OS, uptime, hotfixes and hardware.", 0, "Standard", "Check OS build, boot time and installed updates.", "Get-ComputerInfo"
    ],
    [
        "ipconfig /flushdns", "Clear the local DNS resolver cache.", 1, "Standard", "Low risk and only affects this device's cache. Does not fix a wrong DNS server setting.", "nslookup"
    ],
    [
        "gpupdate /force", "Reapply Group Policy now.", 1, "Standard; may prompt for sign-out or restart", "May log the user off. Warn first and save work.", "gpresult /r"
    ],
    [
        "ipconfig /release then /renew", "Drop and request a new DHCP lease.", 1, "Admin", "Briefly interrupts connectivity. Do not run over a remote session on that adapter.", "ipconfig /all"
    ],
    [
        "sfc /scannow", "Scan and repair protected system files.", 1, "Admin", "Can take a long time and needs a healthy component store. Read CBS.log if repairs fail.", "DISM /Online /Cleanup-Image /ScanHealth"
    ],
    [
        "DISM /Online /Cleanup-Image /ScanHealth", "Check the Windows component store for corruption.", 0, "Admin", "Read-only scan. /RestoreHealth changes state and needs Windows Update or source access.", "sfc /scannow"
    ],
    [
        "taskkill /PID <id>", "Terminate a process.", 2, "Standard for own processes; admin otherwise", "Unsaved data is lost. Never kill security or system processes. Prefer closing normally first.", "tasklist, Get-Process"
    ],
    [
        "Restart-Service <name>", "Restart a Windows service.", 2, "Admin", "Interrupts anything using the service. Check dependents and get approval on shared servers.", "Get-Service"
    ]
];

// Risk labels indexed by the risk number above.
const RK = ["Read-only", "Changes state", "Disruptive"];
