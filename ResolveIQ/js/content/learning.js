/* ============================================================
   Content: articles, labs, scenarios, skills, careers, interview questions
   EDIT HERE to add knowledge articles, labs, simulator scenarios, skills, career paths or interview questions.
   ============================================================ */

// KNOWLEDGE BASE ARTICLES. Each row: [title, category, body]. Lines in the body are separated by \n and render as separate paragraphs.
const KB = [
    [
        "Reading ipconfig /all", "Networking", "Overview: ipconfig /all lists address, mask, gateway, DHCP and DNS servers for each adapter.\nSteps: find the active adapter; check the address is in the expected range (169.254.x.x means DHCP failed); confirm the gateway is in the same subnet as the address; note the DNS servers.\nEscalate when several devices show self-assigned addresses."
    ],
    [
        "DNS failure versus no connectivity", "Networking", "Overview: if ping to an IP works but names fail, the fault is name resolution, not routing.\nSteps: ping 1.1.1.1; run nslookup against the configured server; repeat against a known public resolver. If only the configured server fails, the client DNS setting or server is at fault.\nCommon mistake: flushing the cache when the server setting is wrong."
    ],
    [
        "Why accounts lock out", "Identity and access", "Overview: lockouts follow repeated bad passwords, usually from a stale saved credential rather than the user typing.\nSteps: verify identity; unlock only through the permitted route; ask about phones, mapped drives, VPN and scheduled tasks using the old password.\nSecurity: repeated rapid lockouts can indicate password spraying. Escalate to security."
    ],
    [
        "Priority is impact and urgency", "ITIL and ITSM", "Overview: priority is derived from impact (how many or how important) and urgency (how soon it must be fixed). Severity is a different measure used by some teams.\nExample: one user locked out an hour before a board meeting may be high urgency, low impact. A department printer outage may be the opposite.\nOrganisations define their own matrices; learn yours."
    ],
    [
        "Writing a ticket someone can act on", "Service desk communication", "Overview: record symptom, scope, what you checked, what you observed and the next action.\nSteps: separate facts from assumptions; include exact error text and times; never invent steps or results; leave a placeholder when unknown.\nExample: replace 'Outlook broken, fixed' with the symptom, the test, the result and the change."
    ],
    [
        "Outlook: client, account or service?", "Microsoft 365", "Overview: test Outlook on the web first. If it works, the account is healthy and the client or profile is suspect. If it fails, look at account state and sign-in logs.\nSteps: check scope; test browser; check stored credentials; try a new profile.\nEscalate when many users are affected or Conditional Access is involved. Confirm specifics in Microsoft Learn."
    ],
    [
        "Safe use of state-changing commands", "Troubleshooting methodology", "Overview: diagnostics should be read-only first. Commands that restart services, kill processes, change DNS or reset networking can interrupt the user or others.\nSteps: state the risk; check permissions; warn the user; record the previous state so you can roll back; note it in the ticket.\nEscalate when the action affects shared servers or you lack explicit authority."
    ],
    [
        "Event Viewer basics", "Windows", "Overview: Event Viewer records system, application and security events. Use it to find what happened near the time of the fault.\nSteps: open Windows Logs, System or Application; filter by Error and Critical around the incident time; record the source and Event ID; search the exact ID rather than guessing.\nSecurity: the Security log usually needs admin rights."
    ],
    [
        "Access denied: groups and permissions", "Identity and access", "Overview: access depends on group membership and permissions on the resource. New group membership applies only after a fresh sign-in.\nSteps: confirm the exact resource and error; check the user's groups (whoami /groups); compare with a user who has access; ask the resource owner to approve access.\nSecurity: apply least privilege; never grant access without owner approval."
    ],
    [
        "Recognising a possible major incident", "ITIL and ITSM", "Overview: many users affected, a core service down or a security risk may need the major incident process.\nSteps: count reports and affected sites; check service health; link tickets to one parent; alert the duty manager; keep the user updates factual.\nSecurity: suspected ransomware or data exfiltration means follow incident response, preserve evidence and do not attempt repairs."
    ]
];

// INTERACTIVE LABS. c = the only commands the simulated terminal accepts (lower case) and their fixed output; q/o/a = final question, options and index of the correct answer; x = explanation.
const LB = [
    {
        t: "Diagnose a network problem", g: "A PC cannot reach the internet. Use the supported commands, then name the root cause.", c: {
            "ipconfig /all": "IPv4 Address . . . : 192.168.1.50\nSubnet Mask . . . : 255.255.255.0\nDefault Gateway . : 192.168.2.1\nDNS Servers . . . : 192.168.1.10", "ping 192.168.2.1": "Request timed out.", "ping 192.168.1.1": "Reply from 192.168.1.1: bytes=32 time=1ms", "ping 192.168.1.10": "Reply from 192.168.1.10: bytes=32 time=1ms", "ping 1.1.1.1": "Request timed out."
        }, q: "Root cause?", o: [
            "DNS server is down", "Default gateway is outside the device subnet", "Adapter is disabled", "DHCP lease expired"
        ], a: 1, x: "192.168.2.1 is not inside 192.168.1.0/24, so traffic cannot leave the subnet. The neighbour at 192.168.1.1 replies and is the likely correct gateway. Next lab: DNS."
    },
    {
        t: "Troubleshoot DNS", g: "Websites fail to load. Separate connectivity from name resolution.", c: {
            "ipconfig /all": "IPv4 Address . . . : 10.0.0.25\nDefault Gateway . : 10.0.0.1\nDNS Servers . . . : 10.0.0.99", "ping 10.0.0.1": "Reply from 10.0.0.1: time=1ms", "ping 1.1.1.1": "Reply from 1.1.1.1: time=12ms", "nslookup microsoft.com": "DNS request timed out.\nServer: 10.0.0.99", "nslookup microsoft.com 1.1.1.1": "Name: microsoft.com\nAddress: (valid address returned)"
        }, q: "Root cause?", o: [
            "The DNS server 10.0.0.99 is not responding", "The default gateway is wrong", "The PC has no IP address", "The internet is down"
        ], a: 0, x: "IP connectivity works and a public resolver answers, so only the configured server fails. Check why the client uses 10.0.0.99, and escalate if it serves other devices."
    },
    {
        t: "Resolve an account access issue", g: "User jsmith cannot open the Finance share. Check the account, groups and share permissions, then name the cause.", c: {
            "whoami /groups": "Domain Users\nStaff-All", "get-aduser jsmith": "Enabled: True\nLockedOut: False\nPasswordExpired: False", "get-adprincipalgroupmembership jsmith": "Domain Users\nStaff-All", "get-smbshareaccess -name finance": "Finance-Team   Allow   Change\nDomain Admins  Allow   Full"
        }, q: "Root cause?", o: [
            "Account is locked out", "The user is not in the Finance-Team group", "The share is offline", "Password expired"
        ], a: 1, x: "The account is healthy, but the share only grants Finance-Team and jsmith is not a member. Get approval from the data owner, then an administrator adds the group. Never grant access without approval."
    },
    {
        t: "Troubleshoot a printer", g: "Floor 2 printer shows Offline. Find the cause using the queue, network and service state.", c: {
            "get-printer -name floor2": "Name: Floor2\nPrinterStatus: Offline", "get-printjob -printername floor2": "Id 4  JobStatus: Error  Document: report.pdf\nId 5  JobStatus: Queued", "ping 10.0.5.20": "Reply from 10.0.5.20: bytes=32 time=2ms", "get-service spooler": "Status: Running"
        }, q: "Root cause?", o: [
            "A stuck job at the head of the queue", "The printer is powered off", "The spooler service is stopped", "The wrong driver is installed"
        ], a: 0, x: "The printer answers ping and the spooler runs, so the problem is local. Job 4 has errored and blocks the queue behind it. Cancel it first; restarting the Spooler is state-changing and should be approved on shared servers."
    }
];

// TICKET SIMULATOR SCENARIOS. qs = questions; each option is [text, score (0 or 2), feedback].
const SC = [
    {
        t: "VIP cannot open email", d: "A director reports Outlook is stuck before a 10:00 meeting. Others in the team are fine.", qs: [
            [
                "First action?", [
                    [
                        "Reset her password immediately", 0, "Premature and disruptive; nothing shows a password fault."
                    ], [
                        "Confirm exact symptom and test Outlook on the web", 2, "Good: gathers evidence and splits client from account."
                    ], ["Reinstall Office", 0, "Heavy action with no evidence."]
                ]
            ], [
                "Priority?", [
                    ["Low: only one user", 0, "Ignores urgency and the person involved."], [
                        "High urgency, lower impact: act now, state your reasoning", 2, "Correct: impact and urgency are separate."
                    ], ["Critical major incident", 0, "Overstated for one user."]
                ]
            ], [
                "Browser works, Outlook does not. Update to the user?", [
                    [
                        "Tell her she can use the web version now while you fix the client, with a time for the next update", 2, "Clear workaround and expectation."
                    ], ["No update until fixed", 0, "Leaves the user guessing."]
                ]
            ]
        ]
    },
    {
        t: "Suspected phishing click", d: "A user clicked a link in an email then entered her password on a page that looked like Microsoft sign-in.", qs: [
            [
                "First action?", [
                    [
                        "Treat as a possible compromise and follow the security incident process", 2, "Correct: credentials may be exposed."
                    ], ["Tell her to ignore it", 0, "Unsafe."], ["Delete the email and close the ticket", 0, "Destroys evidence and misses the risk."]
                ]
            ], [
                "What should you capture?", [
                    [
                        "Sender, subject, time of click, URL if known; do not forward widely", 2, "Preserves evidence for security."
                    ], ["Nothing, security will ask later", 0, "Loses time-critical detail."]
                ]
            ]
        ]
    },
    {
        t: "Department printer outage", d: "Twelve people on one floor cannot print and a team has a deadline in two hours.", qs: [
            [
                "First action?", [
                    [
                        "Check whether it is the printer, the print server or the network, and record the scope", 2, "Good: scope and layer come first."
                    ], ["Reinstall drivers on all twelve PCs", 0, "Heavy, risky and unsupported by evidence."]
                ]
            ], [
                "Update to the team?", [
                    [
                        "Give the workaround (nearest printer), what you are checking and a time for the next update", 2, "Clear and honest."
                    ], ["Say it will be fixed soon", 0, "Vague and unhelpful."]
                ]
            ]
        ]
    },
    {
        t: "SLA about to breach", d: "A P2 ticket has 20 minutes left on its resolution target. You are waiting on a vendor.", qs: [[
                "What do you do?", [
                    [
                        "Update the ticket, warn the owner or team lead and request escalation with the evidence", 2, "Right: transparency early."
                    ], ["Wait and hope", 0, "Hides the risk."], ["Close the ticket to stop the clock", 0, "Misleading and unprofessional."]
                ]
            ]]
    }
];

// SKILLS MATRIX. Group name -> list of skills.
const SKG = {
    "Core support": ["Structured troubleshooting", "Ticket documentation", "Prioritisation", "Escalation"], "Windows": ["Event Viewer", "Services and processes", "PowerShell", "Profiles and updates"], "Microsoft ecosystem": ["Microsoft 365", "Active Directory", "Entra ID", "Intune", "Group Policy"], "Networking": ["TCP/IP and subnetting", "DNS and DHCP", "VPN and firewalls"], "Security": ["MFA and least privilege", "Phishing response", "Log analysis"]
};

// CAREER PATHWAYS. Each row: [name, focus, certifications, project].
const CR = [
    [
        "1st to 2nd line", "Deeper Windows, AD, networking, incident ownership", "Optional: CompTIA A+ or Network+", "Document five incidents you owned end to end"
    ], [
        "Systems Administrator", "Windows Server, GPO, PowerShell, DNS, DHCP, backup", "Optional: Microsoft role-based exams", "Build a home lab domain"
    ], [
        "Microsoft Cloud Engineer", "Entra ID, M365, Azure basics, automation", "Optional: Microsoft fundamentals and Azure exams", "Script a user onboarding in Graph PowerShell"
    ], [
        "Cybersecurity Analyst", "Logs, SIEM basics, Defender, incident response", "Optional: Security+", "Write up a simulated phishing investigation"
    ], [
        "Network Engineer", "Subnetting, VLANs, routing, packet analysis", "Optional: Cisco CCNA, Network+", "Capture and explain a DNS exchange in Wireshark"
    ], [
        "Endpoint and Modern Workplace", "Intune, Autopilot, compliance, app deployment", "Optional: Microsoft endpoint exams", "Enrol a test device and document policies"
    ], [
        "IT Service Management", "Incident, problem, change, SLAs, reporting", "Optional: ITIL 4 Foundation", "Propose one problem record from recurring tickets"
    ]
];

// INTERVIEW QUESTIONS. Each row: [question, model answer].
const IV = [
    [
        "A user connects to Wi-Fi but cannot browse. Talk me through it.", "Clarify scope and impact; check ipconfig for a valid address and gateway; ping the gateway, then a public IP, then test DNS. Interpret each result before the next step, avoid state-changing commands until justified, record evidence and escalate if several users are affected."
    ], [
        "A user is locked out before an important meeting.", "Verify identity, unlock via the permitted route, identify the lockout source (saved credentials, phone, mapped drives), explain the cause to the user and escalate repeated lockouts as a possible attack."
    ], [
        "Explain impact versus urgency.", "Impact measures how many people or how much business value is affected. Urgency measures how quickly it must be resolved. Priority is derived from both using the organisation matrix."
    ], [
        "Outlook keeps asking for a password. What do you check?", "Scope first; test Outlook on the web; if it works, check stored credentials then try a new profile; if not, check account state and sign-in logs; escalate Conditional Access or multi-user cases."
    ], [
        "What is DNS and how do you test it?", "DNS translates names to IP addresses. Test with nslookup or Resolve-DnsName against the configured server and a known public resolver; compare results to find whether the client setting or server is at fault."
    ], [
        "Describe a time you handled a difficult user (STAR).", "Use your own real example: Situation, Task, Action, Result. Do not invent experience. Show empathy, clear communication and a measurable, honest result."
    ], [
        "A colleague reports a possible compromised account.", "Do not attempt repair. Follow the security incident process, preserve evidence, avoid tipping off, escalate immediately with times and details."
    ], [
        "When do you escalate?", "When you lack permission, the risk is high, many users are affected, security is involved, or SLA time is at risk. Hand over evidence, steps taken and the next suggested action."
    ]
];
