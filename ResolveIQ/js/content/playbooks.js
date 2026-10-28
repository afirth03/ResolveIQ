/* ============================================================
   Content: troubleshooting playbooks
   EDIT HERE to add or change playbooks (decision trees).
   Pure data: no UI code. Helpers Q, O and R are defined before the second block.
   ============================================================ */

// TROUBLESHOOTING PLAYBOOKS (first three). Each playbook has: t (title), kw (search keywords), h (hypotheses), n (nodes). A node is either a question (q, why, cmd, risk, perm, o = options) or an outcome (res, conf, steps, esc).
const PB = {
    net: {
        t: "Connected but no internet", kw: "wifi wi-fi internet network browse browsing dns dhcp gateway offline ethernet website websites",
        h: {
            adp: ["Adapter or Wi-Fi association fault", 1], dhcp: ["DHCP failure", 1], lan: ["Gateway, switch port or VLAN fault", 1], wan: ["Upstream or ISP outage", 1], dns: ["DNS resolution failure", 1], prx: ["Proxy or browser-level fault", 1]
        },
        n: {
            a: {
                q: "Does the device have a valid IP configuration?", why: "Everything else depends on a usable address, mask and gateway. An address starting 169.254 means the device gave up waiting for DHCP.", cmd: "ipconfig /all", risk: 0, perm: "Standard user",
                o: [
                    {
                        l: "Valid address (for example 192.168.x.x or 10.x.x.x) and a gateway", n: "b", e: "Valid IPv4 address and gateway present", d: {
                            dhcp: -1, adp: -1
                        }
                    }, {
                        l: "169.254.x.x (APIPA) address", n: "dh", e: "APIPA address 169.254.x.x", d: {
                            dhcp: 5, adp: 1
                        }
                    }, {
                        l: "No adapter, or media disconnected", n: "ad", e: "Adapter missing or media disconnected", d: { adp: 5 }
                    }
                ]
            },
            b: {
                q: "Can the device reach its default gateway?", why: "A reply proves the local link, switch port and VLAN work. A failure narrows the fault to the local segment.", cmd: "ping <default-gateway-from-ipconfig>", risk: 0, perm: "Standard user",
                o: [
                    {
                        l: "Replies received", n: "c", e: "Gateway ping succeeded", d: {
                            lan: -2, adp: -2
                        }
                    }, {
                        l: "Request timed out or unreachable", n: "gw", e: "Gateway ping failed", d: {
                            lan: 4, wan: -1, dns: -1, prx: -1
                        }
                    }, {
                        l: "Inconclusive (ICMP may be blocked)", n: "c", e: "Gateway ping inconclusive", d: {}
                    }
                ]
            },
            c: {
                q: "Can the device reach a public IP address directly?", why: "Pinging an IP bypasses DNS. Success means routing to the internet works, so suspect name resolution or the browser.", cmd: "ping 1.1.1.1", risk: 0, perm: "Standard user",
                o: [
                    {
                        l: "Replies received", n: "d", e: "Ping to 1.1.1.1 succeeded", d: {
                            wan: -3, lan: -2
                        }
                    }, {
                        l: "Timed out", n: "wn", e: "Ping to 1.1.1.1 failed with gateway reachable", d: { wan: 5 }
                    }, {
                        l: "Not tested or blocked by policy", n: "d", e: "Ping to 1.1.1.1 not possible", d: {}
                    }
                ]
            },
            d: {
                q: "Does a DNS lookup succeed?", why: "This separates name resolution from connectivity. IP works but names fail is the classic DNS signature.", cmd: "nslookup microsoft.com\nResolve-DnsName microsoft.com", risk: 0, perm: "Standard user",
                o: [
                    {
                        l: "Returns an IP address", n: "px", e: "DNS lookup succeeded", d: {
                            dns: -3, prx: 2
                        }
                    }, {
                        l: "Timed out or server failed", n: "dn", e: "DNS lookup failed while IP connectivity works", d: { dns: 6 }
                    }
                ]
            },
            dh: {
                res: "Likely cause: DHCP did not assign an address.", conf: "Likely, not confirmed", steps: [
                    "Check the Wi-Fi or cable first; try another port or SSID to see if the fault follows the device.", "Ask whether other devices on the same switch or SSID are affected. If so, escalate to networking: DHCP scope exhaustion or relay fault.", "If only this device: ipconfig /release then /renew is state-changing for this adapter only. Warn the user they will briefly lose connectivity."
                ], esc: "Several devices affected, or scope exhaustion suspected."
            },
            ad: {
                res: "Likely cause: the adapter is disabled, unplugged or missing its driver.", conf: "Likely, not confirmed", steps: [
                    "Check physical link, Wi-Fi switch and airplane mode.", "Open Device Manager and look for a warning icon on the network adapter.", "Check Get-NetAdapter output for Status Disconnected or Disabled.", "Enabling an adapter changes state; confirm it is permitted by policy."
                ], esc: "Adapter absent from Device Manager after reboot (possible hardware fault)."
            },
            gw: {
                res: "The local link works or does not: gateway is unreachable from this device.", conf: "Supported by one test", steps: [
                    "Re-seat cable or reconnect Wi-Fi, then repeat the ping.", "Check whether neighbouring devices can reach the gateway. If yes, suspect the port, VLAN or Wi-Fi association for this device.", "Compare the device subnet mask and gateway with a working neighbour. A wrong mask or static address gives this pattern."
                ], esc: "Multiple devices affected, or a switch port or VLAN change is suspected."
            },
            wn: {
                res: "Gateway reachable but nothing beyond it. Suspect the router, firewall or internet provider.", conf: "Likely; verify scope", steps: [
                    "Check whether other users and sites are also offline. Many affected means a possible site outage: follow your major incident process.", "Check the service status page of the provider if you have access.", "Do not change firewall or router settings at 1st line."
                ], esc: "Site-wide impact: escalate immediately with the evidence below."
            },
            dn: {
                res: "IP connectivity works but name resolution fails. DNS is the supported hypothesis.", conf: "Supported by evidence", steps: [
                    "Check which DNS servers ipconfig /all lists. Are they your internal servers, a stale static value or a public resolver blocked by policy?", "Query a known good resolver explicitly: nslookup microsoft.com <internal-dns-ip>. If that works, the client setting is wrong.", "ipconfig /flushdns only clears the local cache. It is low risk but will not fix a bad server setting.", "If the internal DNS server does not respond for several devices, escalate."
                ], esc: "Internal DNS server not responding for multiple devices."
            },
            px: {
                res: "Name resolution and routing work. Look at the browser, proxy or security filtering.", conf: "Possible; not confirmed", steps: [
                    "Try a different browser and a private window to rule out extensions.", "Check proxy settings (Settings, Network, Proxy) and any PAC file. A stale proxy after VPN use is common.", "Check the error: certificate errors suggest TLS inspection or wrong system time; a block page indicates web filtering.", "Do not disable security software as a shortcut. Escalate if filtering is suspected."
                ], esc: "Block page or certificate warnings across many sites."
            }
        }
    },
    out: {
        t: "Outlook keeps asking for a password", kw: "outlook password credentials prompt mfa sign in login email mailbox keeps asking authentication",
        h: {
            cred: ["Stale cached credentials", 1], id: ["Account or password state (expired, locked, MFA)", 1], ca: ["Conditional Access or token issue", 1], prof: ["Outlook profile fault", 1], svc: ["Service-side Exchange Online issue", 1]
        },
        n: {
            a: {
                q: "How many users are affected?", why: "Scope separates a single-client fault from a service or tenant problem and decides whether this is a possible major incident.", cmd: "Check the Microsoft 365 admin centre service health (needs admin) or ask colleagues", risk: 0, perm: "Service health needs an admin role",
                o: [
                    {
                        l: "Only this user", n: "b", e: "Single user affected", d: {
                            svc: -2, prof: 1, cred: 1
                        }
                    }, {
                        l: "Several users", n: "mu", e: "Multiple users affected", d: {
                            svc: 5, ca: 2, cred: -2
                        }
                    }, {
                        l: "Unknown", n: "b", e: "Scope not established", d: {}
                    }
                ]
            },
            b: {
                q: "Can the user sign in at outlook.office.com in a browser?", why: "A working browser sign-in proves the account, password and MFA are good, which points the fault at the Outlook client.", cmd: "Use a private browser window", risk: 0, perm: "Standard user",
                o: [
                    {
                        l: "Browser sign-in works", n: "c", e: "Outlook on the web works", d: {
                            id: -3, svc: -3, cred: 3, prof: 2
                        }
                    }, {
                        l: "Browser sign-in fails", n: "id", e: "Browser sign-in also fails", d: {
                            id: 5, ca: 2, cred: -2, prof: -2
                        }
                    }
                ]
            },
            c: {
                q: "Are old entries present in Credential Manager?", why: "Cached Office or MicrosoftOffice16 tokens can persist after a password change and cause repeated prompts.", cmd: "control /name Microsoft.CredentialManager", risk: 1, perm: "Standard user; removing entries signs the user out of those apps",
                o: [
                    {
                        l: "Stale Office or Outlook entries found", n: "cr", e: "Stale credentials found in Credential Manager", d: { cred: 5 }
                    }, {
                        l: "Nothing relevant", n: "pf", e: "No stale credentials", d: {
                            cred: -3, prof: 3
                        }
                    }
                ]
            },
            mu: {
                res: "Multiple users affected: treat as a possible service or tenant issue.", conf: "Possible", steps: [
                    "Check Microsoft 365 service health and known incidents.", "Look for a recent change: Conditional Access, MFA registration or a password policy update.", "Do not reset individual credentials.", "Raise or link a major incident per your process."
                ], esc: "Escalate now with the affected-user list and first-report time."
            },
            id: {
                res: "The account cannot authenticate even in a browser. Investigate account state.", conf: "Supported by evidence", steps: [
                    "Check for lockout, expired password, disabled account or changed MFA method (needs the right permissions).", "If you have access, read the Entra sign-in log failure code and Conditional Access result; do not guess from the user report.", "Reset passwords only after verifying identity per policy."
                ], esc: "Failure involves Conditional Access, risky sign-in or suspected compromise: follow security incident procedure."
            },
            cr: {
                res: "Stale cached credentials are the supported cause.", conf: "Supported; verify after fix", steps: [
                    "Close Outlook. Remove the stale Microsoft Office and Outlook entries, noting this signs the user out of them.", "Restart Outlook and sign in again. Expect an MFA prompt.", "Verify: send and receive a test message and confirm no further prompts after a restart."
                ], esc: "Prompts return after clearing credentials: check sign-in logs."
            },
            pf: {
                res: "Account and credentials look fine. Suspect the Outlook profile.", conf: "Possible", steps: [
                    "Create a new profile through Control Panel, Mail, Show Profiles. This does not delete the old one.", "Test the new profile. If it works, the old profile is corrupt; move the user across and explain the OST resync time.", "Escalate if a new profile also prompts."
                ], esc: "New profile also fails."
            }
        }
    },
    win: {
        t: "User cannot sign in to Windows", kw: "windows sign in login logon locked lockout password domain profile trust relationship cannot log",
        h: {
            lock: ["Account locked out", 1], pw: ["Wrong or expired password", 1], net: ["No route to a domain controller", 1], trust: ["Broken machine trust", 1], prof: ["Profile fault", 1]
        },
        n: {
            a: {
                q: "What exact message does the sign-in screen show?", why: "The message is the strongest early evidence. Do not infer it from the user description.", cmd: "Ask for a photo of the screen", risk: 0, perm: "None",
                o: [
                    {
                        l: "Account locked out", n: "lk", e: "Message: account locked out", d: { lock: 8 }
                    }, {
                        l: "Password incorrect or must be changed", n: "pw", e: "Message: password incorrect or expired", d: { pw: 6 }
                    }, {
                        l: "Domain not available or trust relationship failed", n: "b", e: "Message: domain unavailable or trust relationship failed", d: {
                            net: 3, trust: 3
                        }
                    }, {
                        l: "User profile service failed or temporary profile", n: "pf", e: "Profile error shown", d: { prof: 8 }
                    }
                ]
            },
            b: {
                q: "Can the device reach the network or VPN?", why: "Without a route to a domain controller, new sign-ins cannot validate. A trust error with a healthy network suggests a broken machine account.", cmd: "ping <domain-controller-or-domain-name>\nTest-NetConnection <dc> -Port 389", risk: 0, perm: "Standard user",
                o: [
                    {
                        l: "Reachable", n: "tr", e: "Domain controller reachable", d: {
                            net: -3, trust: 4
                        }
                    }, {
                        l: "Not reachable", n: "nt", e: "Domain controller unreachable", d: { net: 5 }
                    }
                ]
            },
            lk: {
                res: "Account lockout confirmed by the message.", conf: "Confirmed", steps: [
                    "Verify the user identity per policy before any unlock.", "Request an unlock from the team with permission; do not unlock automatically.", "Ask where the old password might be saved: phones, mapped drives, VPN, scheduled tasks. These are the usual lockout sources.", "If lockouts repeat within minutes, treat as possible attack and escalate to security."
                ], esc: "Repeated lockouts or lockout source unknown."
            },
            pw: {
                res: "Password problem: wrong, expired or changed.", conf: "Likely", steps: [
                    "Check caps lock and keyboard layout.", "Verify identity, then use the approved self-service reset or a reset by authorised staff.", "Warn the user that other devices and Outlook may need the new password."
                ], esc: "Reset fails or account shows unexpected activity."
            },
            tr: {
                res: "Network is fine but trust fails: the machine account may be broken.", conf: "Possible", steps: [
                    "Check the device clock and last sign-in date.", "Repair needs local admin and domain permissions; this is a 2nd-line action.", "Capture the exact error and device name."
                ], esc: "Escalate to 2nd line for machine-account repair."
            },
            nt: {
                res: "No route to a domain controller.", conf: "Likely", steps: [
                    "If the user is remote, connect to VPN first or use cached credentials if previously signed in.", "Switch to the no-internet playbook for connectivity checks."
                ], esc: "Multiple devices on site cannot reach the domain."
            },
            pf: {
                res: "Profile fault. Do not delete the profile as a first step.", conf: "Possible", steps: [
                    "Sign in with another account to confirm the device is otherwise healthy.", "Check Event Viewer for User Profile Service events and disk space.", "Back up user data before any profile rebuild; this is destructive."
                ], esc: "Data at risk or disk errors suspected."
            }
        }
    },
    prn: {
        t: `Printer offline or not printing`, kw: `printer print offline queue stuck spooler driver paper job`,
        h: {
            que: [`Stuck print queue`, 1], net: [`Printer unreachable on the network`, 1], drv: [`Driver or port fault`, 1], dev: [`Printer hardware or offline state`, 1]
        },
        n: {
            a: {
                q: `Is the problem affecting one user or everyone who uses this printer?`, why: `Scope separates a local client fault from a printer or network fault.`, cmd: `Ask two other users to print a test page`, risk: 0, perm: `None`, o: [
                    {
                        l: `Only this user`, n: `b`, e: `Single user affected`, d: {
                            que: 2, drv: 2, net: -1, dev: -2
                        }
                    }, {
                        l: `Everyone`, n: `c`, e: `All users of this printer affected`, d: {
                            net: 3, dev: 3, que: -1, drv: -2
                        }
                    }
                ]
            },
            b: {
                q: `Does the local print queue show stuck or errored jobs?`, why: `One failed job at the head of the queue blocks everything behind it.`, cmd: `Get-PrintJob -PrinterName <name>\nSettings, Printers and scanners, Open print queue`, risk: 0, perm: `Standard user`, o: [
                    {
                        l: `Stuck or errored job at the head`, n: `qr`, e: `Stuck job in queue`, d: { que: 6 }
                    }, {
                        l: `Queue empty, or status shows Offline`, n: `c`, e: `Queue empty or printer shows Offline`, d: {
                            que: -2, net: 2
                        }
                    }
                ]
            },
            c: {
                q: `Does the printer reply to ping at its IP address?`, why: `A reply proves power, network link and IP are working, moving suspicion to drivers or ports.`, cmd: `ping <printer-ip>`, risk: 0, perm: `Standard user`, o: [
                    {
                        l: `Replies`, n: `dr`, e: `Printer reachable by ping`, d: {
                            net: -3, drv: 3
                        }
                    }, {
                        l: `No reply`, n: `pn`, e: `Printer not reachable by ping`, d: {
                            net: 4, dev: 3
                        }
                    }
                ]
            },
            qr: {
                res: `A stuck job in the local queue is the likely cause.`, conf: `Supported by evidence`, steps: [
                    `Cancel the stuck job from the print queue and retry.`, `If it will not cancel, restarting the Print Spooler (Restart-Service Spooler, admin) is state-changing. On a shared print server it interrupts every user, so get approval first.`, `Verify with a test page and ask the user to confirm.`
                ], esc: `Jobs keep sticking: suspect a faulty driver or a corrupt document; escalate.`
            },
            dr: {
                res: `Printer is reachable but not printing for this user: suspect the driver or port.`, conf: `Possible`, steps: [
                    `Check the printer port IP matches the printer current address (DHCP changes are common).`, `Compare the driver with a working colleague's setup.`, `Reinstalling a driver changes the system; confirm it is permitted and note the old version.`
                ], esc: `Driver deployment is managed centrally.`
            },
            pn: {
                res: `Printer is not reachable: power, network link or IP change.`, conf: `Likely`, steps: [
                    `Check power, the printer display and the network cable or Wi-Fi status.`, `Print the printer's configuration page to see its current IP.`, `If a whole department is affected, treat as a site incident and escalate.`
                ], esc: `Printer reachable from no device, or switch port suspected.`
            }
        }
    },
    slow: {
        t: `Slow Windows computer`, kw: `slow computer laptop performance freezing lag cpu memory ram disk startup sluggish`,
        h: {
            cpu: [`CPU-bound process`, 1], ram: [`Memory pressure`, 1], dsk: [`Disk saturation or failing disk`, 1], st: [`Startup load or pending updates`, 1]
        },
        n: {
            a: {
                q: `In Task Manager, Performance tab, which resource is sustained near 100 per cent?`, why: `The saturated resource decides where to look. Watch for a minute; brief spikes are normal.`, cmd: `Ctrl+Shift+Esc, Performance tab\nGet-Process | Sort CPU -Desc | Select -First 5`, risk: 0, perm: `Standard user`, o: [
                    {
                        l: `CPU`, n: `cp`, e: `CPU sustained near 100 percent`, d: { cpu: 6 }
                    }, {
                        l: `Memory`, n: `rm`, e: `Memory sustained near 100 percent`, d: { ram: 6 }
                    }, {
                        l: `Disk`, n: `dk`, e: `Disk sustained near 100 percent`, d: { dsk: 6 }
                    }, {
                        l: `None: only slow shortly after sign-in`, n: `su`, e: `No sustained saturation; slow after sign-in`, d: { st: 6 }
                    }
                ]
            },
            dk: {
                q: `Are there disk errors in the System log or a SMART warning?`, why: `Disk saturation from a failing drive needs a different response from heavy software activity.`, cmd: `Get-WinEvent -FilterHashtable @{LogName='System';Id=7,11,51,153} -MaxEvents 10`, risk: 0, perm: `Standard user (some systems need admin)`, o: [
                    {
                        l: `Errors or warnings present`, n: `df`, e: `Disk errors or SMART warning present`, d: { dsk: 4 }
                    }, {
                        l: `None found`, n: `dh`, e: `No disk errors found`, d: {
                            dsk: -1, st: 2
                        }
                    }
                ]
            },
            cp: {
                res: `A process is consuming CPU. Identify it before acting.`, conf: `Supported by evidence`, steps: [
                    `Sort Task Manager by CPU and note the process name. Is it expected (update, antivirus scan) or unknown?`, `Terminating processes is disruptive and loses unsaved data. Prefer waiting for scans to finish.`, `Unknown process using high CPU may be a security issue: escalate rather than deleting it.`
                ], esc: `Unknown process, or high CPU persists after reboot.`
            },
            rm: {
                res: `Memory is exhausted, so Windows is paging to disk.`, conf: `Supported by evidence`, steps: [
                    `Identify the largest consumers (browser tabs, Teams, Office).`, `Ask the user to close unneeded apps and restart if uptime is long.`, `If installed memory is consistently too low for the user's work, raise a hardware request.`
                ], esc: `Memory climbs steadily with nothing running (possible leak).`
            },
            df: {
                res: `Disk errors point to a possibly failing drive.`, conf: `Possible; confirm`, steps: [
                    `Advise the user to back up important data now.`, `Do not run repair tools that write to a failing disk before data is safe.`, `Raise a hardware replacement request with the event IDs and times as evidence.`
                ], esc: `Escalate to 2nd line or hardware support promptly.`
            },
            dh: {
                res: `Disk is busy without errors. Likely software activity such as updates, search indexing or antivirus.`, conf: `Likely`, steps: [
                    `Check Windows Update and antivirus scan status.`, `Check free space; under 10 percent can cause slowdowns.`, `Re-test after the activity completes.`
                ], esc: `Persists for days with no explainable process.`
            },
            su: {
                res: `Slowness after sign-in suggests startup load or pending updates.`, conf: `Possible`, steps: [
                    `Open Task Manager, Startup apps, and review high-impact entries.`, `Check for pending updates and restarts.`, `Disable only non-essential items and tell the user what changed.`
                ], esc: `Managed startup items are set by policy.`
            }
        }
    }
};

// Helpers that keep playbook nodes short. Q = question node, O = answer option, R = outcome (result) node.
const Q = (q, why, cmd, risk, perm, o) => ({
    q, why, cmd, risk, perm, o
}), O = (l, n, e, d = {}) => ({
    l, n, e, d
}), R = (res, conf, steps, esc) => ({
    res, conf, steps, esc
});

// MORE PLAYBOOKS, set 1. To add a playbook, add an entry here using Q, O and R. It appears automatically on the home page, in Troubleshoot, and in diagnosis search.
Object.assign(PB, {
    mfa: {
        t: `MFA prompt not arriving or failing`, kw: `mfa authenticator two factor code prompt verification sign token`, h: {
            app: [`Phone or authenticator app fault`, 1], reg: [`Method lost or changed`, 1], atk: [`Possible compromise`, 1]
        }, n: {
            a: Q(`Is the user receiving approval prompts they did not trigger?`, `Unrequested prompts may mean someone else has the password. This is a security question before a support one.`, `Ask the user directly`, 0, `None`, [
                O(`Yes, unexpected prompts`, `sec`, `Unrequested MFA prompts reported`, { atk: 9 }), O(`No, user is signing in normally`, `b`, `No unexpected prompts`, { atk: -2 })
            ]),
            b: Q(`Does the phone have data, automatic time and notifications allowed for the authenticator?`, `Push approval needs connectivity and notifications. Clock drift breaks code-based methods.`, `Check phone data, time settings and app notifications`, 0, `None`, [
                O(`Found and fixed a phone problem`, `ph`, `Phone connectivity, time or notification fault found`, { app: 6 }), O(`Phone is fine`, `rg`, `Phone connectivity, time and notifications fine`, {
                    app: -3, reg: 3
                })
            ]),
            sec: R(`Possible account compromise. Stop troubleshooting.`, `Escalate`, [
                `Tell the user to deny every prompt and not approve any.`, `Raise a security incident per your process; keep times and details.`, `Password reset and session revocation are for authorised staff.`
            ], `Immediately.`),
            ph: R(`A phone-side fault is the likely cause.`, `Likely`, [
                `Retry sign-in and confirm the prompt arrives.`, `If a code method fails, set the phone clock to automatic.`
            ], `Prompts still fail after the phone is fixed.`),
            rg: R(`The registered method may be lost, changed or replaced (new phone).`, `Possible`, [
                `Verify identity per policy.`, `Resetting MFA methods needs an authorised administrator.`, `If you have access, read the sign-in log MFA failure detail.`
            ], `Escalate to the identity team for a method reset.`)
        }
    },
    teams: {
        t: `Teams microphone or camera not working`, kw: `teams microphone mic camera webcam audio sound meeting headset speaker`, h: {
            perm: [`Permissions or privacy settings`, 1], sel: [`Wrong device selected`, 1], drv: [`Driver or hardware fault`, 1], app: [`Teams client issue`, 1]
        }, n: {
            a: Q(`Does the device work in another app, such as Windows Voice Recorder or Camera?`, `This separates a device or Windows fault from a Teams fault.`, `Open the Camera app or Sound settings input meter`, 0, `Standard user`, [
                O(`Works elsewhere`, `b`, `Device works outside Teams`, {
                    app: 3, sel: 3, drv: -3
                }), O(`Fails everywhere`, `c`, `Device fails in every app`, {
                    drv: 4, perm: 3, app: -3
                })
            ]),
            b: Q(`In Teams, Settings, Devices: is the correct device selected, and does the test show input?`, `Teams may default to another microphone, such as a monitor or dock.`, `Teams, Settings, Devices`, 0, `Standard user`, [
                O(`Wrong device; correcting it fixes it`, `sf`, `Wrong device selected in Teams`, { sel: 8 }), O(`Correct device already selected`, `rt`, `Correct device selected but still failing`, {
                    app: 4, sel: -3
                })
            ]),
            c: Q(`Are Windows privacy settings and Device Manager showing the device as allowed and healthy?`, `Disabled access or a driver warning prevents every app from using the device.`, `Settings, Privacy, Microphone or Camera\nDevice Manager`, 0, `Standard user`, [
                O(`Access blocked, or device disabled or warning icon`, `pm`, `Privacy block or driver warning`, {
                    perm: 5, drv: 3
                }), O(`All appears fine`, `hw`, `Settings and Device Manager look healthy`, { drv: 4 })
            ]),
            sf: R(`Wrong input device was selected.`, `Confirmed by the fix`, [
                `Select the correct device in Teams and run a test call.`, `Explain how to check it before important meetings.`
            ], `Not needed.`),
            rt: R(`Teams client issue is possible.`, `Possible`, [
                `Sign out and back in, then fully quit Teams and reopen.`, `Check Teams is up to date.`, `Clearing the Teams cache changes local state and signs the user out; warn them first.`
            ], `Fails for several users: check Microsoft 365 service health.`),
            pm: R(`Windows privacy block or driver warning.`, `Supported`, [
                `Enable device access if policy allows.`, `A driver warning needs an approved driver from the vendor or Windows Update.`
            ], `Access is managed by policy, or driver install is not permitted.`),
            hw: R(`Possible hardware fault.`, `Possible`, [
                `Try a different USB port or another headset.`, `Test the same device on another computer.`
            ], `Device fails on a second computer: replace it.`)
        }
    },
    vpn: {
        t: `VPN connects but internal resources unreachable`, kw: `vpn remote tunnel internal resources file server intranet connected cannot reach`, h: {
            dns: [`Internal DNS not used`, 1], route: [`Routing or split tunnel`, 1], acl: [`Firewall or access policy`, 1], svc: [`Target server down`, 1]
        }, n: {
            a: Q(`Can the user reach the internal resource by IP address?`, `If the IP works and the name does not, the fault is DNS, not the tunnel.`, `ping <server-ip>\nTest-NetConnection <server-ip> -Port 445`, 0, `Standard user`, [
                O(`IP works, name fails`, `dn`, `Internal resource reachable by IP but not by name`, { dns: 8 }), O(`Neither works`, `b`, `Neither IP nor name reachable over VPN`, {
                    dns: -2, route: 3, acl: 3
                }), O(`Both work`, `ok`, `Resource reachable by IP and name`, {})
            ]),
            b: Q(`Can other VPN users reach the same resource?`, `This tells you whether the fault is the user's tunnel or the resource.`, `Ask a colleague on VPN to test`, 0, `None`, [
                O(`Colleagues cannot either`, `sv`, `Other VPN users also cannot reach it`, { svc: 8 }), O(`Colleagues can`, `rc`, `Other VPN users can reach it`, {
                    route: 3, acl: 3, svc: -4
                })
            ]),
            dn: R(`VPN client is not using internal DNS.`, `Supported`, [
                `Check DNS servers on the VPN adapter with ipconfig /all.`, `Test nslookup against the internal DNS server.`, `Reconnecting the VPN is low risk; changing VPN configuration is not.`
            ], `VPN profile DNS settings need an administrator.`),
            sv: R(`The resource or network path may be down for everyone.`, `Likely`, [
                `Check service status and any recent change.`, `Treat as a possible wider incident and link tickets.`
            ], `Escalate with the list of affected users.`),
            rc: R(`Problem is specific to this user or device.`, `Possible`, [
                `Check the VPN group membership and device compliance.`, `Compare the assigned address and routes with a working colleague.`
            ], `Group or policy changes are needed.`),
            ok: R(`Access works now. Check whether the fault is intermittent.`, `Inconclusive`, [
                `Ask the user to retry and note the exact error.`, `Record the times for later correlation.`
            ], `Recurs: escalate with timestamps.`)
        }
    },
    smb: {
        t: `Cannot access shared mailbox`, kw: `shared mailbox access permission delegate exchange outlook folder send as full access`, h: {
            perm: [`Permission not granted`, 1], sync: [`Not yet propagated or cached`, 1], cli: [`Outlook client issue`, 1]
        }, n: {
            a: Q(`Has the user been granted Full Access on the mailbox, and when?`, `Permissions can take time to appear in Outlook. If never granted, no client fix will help.`, `Ask the mailbox owner or check in the Exchange admin centre (needs admin)`, 0, `Admin role to verify`, [
                O(`Never granted`, `np`, `Permission not granted`, { perm: 9 }), O(`Granted more than an hour ago`, `b`, `Full Access granted over an hour ago`, {
                    sync: -2, cli: 3
                }), O(`Granted recently`, `pr`, `Full Access granted recently`, { sync: 6 })
            ]),
            b: Q(`Can the user open the mailbox in Outlook on the web?`, `The web version avoids local cache problems.`, `outlook.office.com, then Open another mailbox`, 0, `Standard user`, [
                O(`Works on the web`, `cc`, `Shared mailbox opens in Outlook on the web`, { cli: 6 }), O(`Fails on the web`, `np`, `Shared mailbox fails on the web too`, { perm: 5 })
            ]),
            np: R(`Permission is missing or wrong.`, `Supported`, [
                `Obtain approval from the mailbox owner.`, `An administrator adds Full Access or Send As. Apply least privilege.`
            ], `Needs a permissions change.`),
            pr: R(`Recently granted. Propagation or caching delay.`, `Likely`, [`Wait a short time and restart Outlook.`, `Check again with Outlook on the web.`], `Still missing after several hours.`),
            cc: R(`Outlook client cache or profile issue.`, `Likely`, [
                `Restart Outlook, then remove and re-add the mailbox.`, `If unresolved, try a new profile.`
            ], `New profile fails too.`)
        }
    },
    gpo: {
        t: `Group Policy not applying`, kw: `group policy gpo gpupdate gpresult policy not applying drive mapping settings`, h: {
            scope: [`Wrong scope or OU`, 1], filt: [`Security filtering or WMI filter`, 1], dc: [`Cannot reach domain controller`, 1], rep: [`Replication delay`, 1]
        }, n: {
            a: Q(`Does gpresult show the GPO under applied or denied policies?`, `gpresult shows applied policies and the reason for any denial.`, `gpresult /r\ngpresult /h report.html`, 0, `Standard (computer scope needs admin)`, [
                O(`Listed as applied`, `ap`, `GPO listed as applied`, {
                    scope: -3, filt: -3
                }), O(`Denied by security filtering`, `ft`, `GPO denied by security filtering`, { filt: 8 }), O(`Not listed at all`, `b`, `GPO not listed`, {
                    scope: 4, dc: 3
                })
            ]),
            b: Q(`Can the device reach a domain controller?`, `Policy is fetched from the domain. Remote devices need VPN.`, `nltest /dsgetdc:<domain>`, 0, `Standard user`, [
                O(`Yes`, `sc`, `Domain controller reachable`, {
                    scope: 4, dc: -3
                }), O(`No`, `dc`, `Domain controller not reachable`, { dc: 8 })
            ]),
            ap: R(`The GPO applies. The setting may be overridden or not what was expected.`, `Likely`, [
                `Check the precedence of other GPOs and the exact setting value.`, `Review the gpresult report for conflicts.`
            ], `GPO design changes belong to administrators.`),
            ft: R(`Security filtering excludes this user or computer.`, `Supported`, [
                `Record the GPO name and the filtering group.`, `Do not change filtering without the GPO owner.`
            ], `Request from the GPO owner.`),
            sc: R(`Likely linked to a different OU, or targeted wrongly.`, `Possible`, [
                `Find the OU of the user or computer.`, `gpupdate /force may sign out or restart; warn the user first.`
            ], `Needs GPO link review.`),
            dc: R(`Device cannot reach a domain controller.`, `Likely`, [
                `Connect to VPN or the office network.`, `Use the no-internet playbook for connectivity checks.`
            ], `Several devices on site affected.`)
        }
    },
    chg: {
        t: `Laptop will not charge`, kw: `laptop charge charging battery power adapter charger not charging usb-c`, h: {
            psu: [`Faulty charger or cable`, 1], dock: [`Dock or port power limit`, 1], bat: [`Battery fault`, 1], board: [`Charging port or board fault`, 1]
        }, n: {
            a: Q(`Does the laptop charge with a known good charger directly in the wall, not through a dock?`, `This removes charger, dock and extension lead from the equation.`, `Try a spare charger with the same wattage`, 0, `None`, [
                O(`Charges`, `ps`, `Charges with a known good charger`, {
                    psu: 7, dock: 2
                }), O(`Still not charging`, `b`, `No charge with a known good charger`, {
                    psu: -4, bat: 3, board: 3
                })
            ]),
            b: Q(`Does Windows report the battery, and does it show a health warning?`, `Battery reporting reveals a failing battery versus a port problem.`, `powercfg /batteryreport (creates a report file)`, 1, `Standard user (writes a report file)`, [
                O(`Battery missing or reported dead`, `bt`, `Battery missing or flagged as failed`, { bat: 8 }), O(`Battery detected, still not charging`, `bd`, `Battery detected but not charging`, { board: 5 })
            ]),
            ps: R(`The original charger, cable or dock is faulty.`, `Supported`, [`Replace the charger or cable.`, `Check dock wattage meets the laptop requirement.`], `Charger replaced and fault remains.`),
            bt: R(`Battery fault is likely.`, `Likely`, [
                `Do not use a swollen battery. Stop using the device and escalate for safety.`, `Raise a hardware replacement.`
            ], `Any swelling or heat: escalate now.`),
            bd: R(`Charging port or board fault is possible.`, `Possible`, [
                `Inspect the port for debris or damage without using metal tools.`, `Raise a hardware repair with evidence.`
            ], `Hardware repair.`)
        }
    },
    int: {
        t: `Device missing or non-compliant in Intune`, kw: `intune device compliance missing enrol endpoint manager mdm policy autopilot not showing`, h: {
            enr: [`Not enrolled`, 1], sync: [`Sync delay`, 1], cmp: [`Failing a compliance rule`, 1], lic: [`Licence or user scope`, 1]
        }, n: {
            a: Q(`Does Settings, Accounts, Access work or school show the device as connected to the organisation?`, `Without a work account connection and management, the device cannot report to Intune.`, `Settings, Accounts, Access work or school, then Info`, 0, `Standard user`, [
                O(`Not connected or no management info`, `en`, `Device not enrolled`, { enr: 8 }), O(`Connected and managed`, `b`, `Device shows as connected and managed`, { enr: -3 })
            ]),
            b: Q(`Does the device appear in the Intune admin centre, and what is the compliance state?`, `The state shows whether the device is absent, syncing late or failing a rule.`, `Intune admin centre, Devices (needs a suitable admin role)`, 0, `Intune role`, [
                O(`Present and non-compliant`, `cp`, `Device present but non-compliant`, { cmp: 8 }), O(`Present, last check-in is old`, `sy`, `Last check-in is old`, { sync: 7 }), O(`Absent`, `lc`, `Device not visible in Intune`, {
                    enr: 4, lic: 4
                })
            ]),
            en: R(`The device is not enrolled.`, `Supported`, [
                `Check the user licence and enrolment restrictions with an admin.`, `Do not remove the device from management without approval.`
            ], `Enrolment needs an administrator.`),
            cp: R(`A compliance rule is failing.`, `Supported`, [
                `Read which setting failed in the device compliance view.`, `Common causes: encryption, OS version, security software.`, `Fix the cause rather than excluding the device.`
            ], `Escalate to the endpoint team.`),
            sy: R(`Sync delay is likely.`, `Likely`, [`Sync from Settings, Access work or school, Info.`, `Allow time and recheck.`], `Not updating after a day.`),
            lc: R(`Not visible: licence, user scope or enrolment issue.`, `Possible`, [`Verify the user licence and group.`, `Check the correct tenant.`], `Admin review.`)
        }
    },
    secx: {
        t: `Suspected account compromise or ransomware`, kw: `compromise hacked phishing ransomware malware suspicious encrypted files breach infected account takeover`, h: {
            ph: [`Phishing credential theft`, 1], mal: [`Malware or ransomware`, 1], fp: [`False alarm`, 1]
        }, n: {
            a: Q(`Are files being renamed or encrypted, or is a ransom note showing?`, `This pattern means possible ransomware: containment and incident response take priority over repair.`, `Observe only. Do not open or run anything.`, 0, `None`, [
                O(`Yes`, `rw`, `Ransom note or encrypted files observed`, { mal: 9 }), O(`No, suspicious email or login only`, `ac`, `Suspicious email or sign-in, no encryption seen`, { ph: 5 })
            ]),
            rw: R(`Possible ransomware. Follow incident response now.`, `Escalate`, [
                `Call the security contact or duty manager now. Do not rely on a ticket alone.`, `Follow your process for isolating the device. Do not power off unless instructed; memory evidence may be lost.`, `Do not attempt recovery or pay anyone. Preserve evidence.`
            ], `Immediately.`),
            ac: R(`Possible account compromise via phishing.`, `Escalate`, [
                `Record what was clicked, when, and what was entered. Preserve the email.`, `Raise a security incident.`, `Password resets and session revocation are for authorised staff.`, `Do not disable security controls as a shortcut.`
            ], `Immediately.`)
        }
    }
});

// MORE PLAYBOOKS, set 2.
Object.assign(PB, {
    olk: {
        t: `Outlook cannot send or receive email`, kw: `outlook send receive email stuck outbox disconnected offline mail not arriving`, h: {
            cli: [`Outlook offline or profile fault`, 1], big: [`Message or attachment problem`, 1], mbx: [`Mailbox full or restricted`, 1], svc: [`Service-side issue`, 1]
        }, n: {
            a: Q(`Does the status bar show Disconnected, Working Offline or a specific error?`, `Outlook states its connection state. A clear Disconnected points at connectivity or authentication.`, `Look at the bottom of the Outlook window and the Send/Receive tab`, 0, `Standard user`, [
                O(`Working Offline`, `of`, `Outlook is in Work Offline mode`, { cli: 7 }), O(`Disconnected or error`, `b`, `Outlook shows Disconnected or an error`, {
                    cli: 2, svc: 2
                }), O(`Connected but mail stuck in Outbox`, `bg`, `Connected, message stuck in Outbox`, {
                    big: 6, mbx: 3
                })
            ]),
            b: Q(`Does Outlook on the web send and receive normally?`, `Web working means the mailbox and account are healthy.`, `outlook.office.com`, 0, `Standard user`, [
                O(`Web works`, `cl`, `Outlook on the web works`, {
                    cli: 6, svc: -4
                }), O(`Web also fails`, `sv`, `Outlook on the web fails too`, {
                    svc: 6, cli: -3
                })
            ]),
            of: R(`Offline mode is enabled.`, `Confirmed by the status`, [`On the Send/Receive tab, turn off Work Offline.`, `Send a test message and confirm.`], `Reverts repeatedly: check network.`),
            bg: R(`A single message may be blocking, often a large attachment or mailbox limit.`, `Likely`, [
                `Open the Outbox, note the message size and any error text.`, `Move the message to Drafts to unblock the queue; do not delete it.`, `Check mailbox storage with the user or an admin.`
            ], `Mailbox full or send restrictions need an admin.`),
            cl: R(`Client or profile fault.`, `Likely`, [
                `Restart Outlook, then check for pending updates.`, `Try a new profile. The old one is not deleted.`
            ], `New profile fails.`),
            sv: R(`Possible mailbox or service issue.`, `Possible`, [
                `Check Microsoft 365 service health.`, `Ask whether colleagues are affected.`, `Record the exact error text and time.`
            ], `Several users affected: treat as an incident.`)
        }
    },
    od: {
        t: `OneDrive sync errors`, kw: `onedrive sync error files not syncing red cross pending cloud folder`, h: {
            auth: [`Sign-in or token problem`, 1], file: [`File name, size or lock`, 1], space: [`Storage or quota full`, 1], net: [`Connectivity or policy`, 1]
        }, n: {
            a: Q(`What does the OneDrive icon and its menu say?`, `The sync menu names affected files and reasons.`, `Click the OneDrive icon in the notification area`, 0, `Standard user`, [
                O(`Sign-in required`, `au`, `OneDrive requests sign-in`, { auth: 8 }), O(`Specific files have errors`, `b`, `Specific files show sync errors`, { file: 6 }), O(`Storage is full`, `sp`, `OneDrive reports storage full`, { space: 9 }), O(`Paused or no connection`, `nt`, `OneDrive paused or offline`, { net: 6 })
            ]),
            b: Q(`Does the error mention invalid characters, a long path or a file in use?`, `These are the most common per-file causes.`, `Open the error detail in the sync menu`, 0, `Standard user`, [
                O(`Name, path or lock issue`, `fl`, `Invalid characters, long path or file locked`, { file: 5 }), O(`Something else`, `ot`, `Error reason unclear`, { file: -1 })
            ]),
            au: R(`Sign-in or token issue.`, `Supported`, [
                `Sign in again. If it loops, follow the Outlook credentials playbook.`, `Check the account state if sign-in fails.`
            ], `Identity team if the account is blocked.`),
            sp: R(`Storage is full.`, `Confirmed by the message`, [
                `Check usage in OneDrive settings.`, `Move large items; do not delete anything without the user's consent.`
            ], `Quota increases need approval.`),
            nt: R(`Sync is paused or the network is blocking it.`, `Likely`, [
                `Resume sync and check internet access.`, `Metered-connection and battery-saver pauses are common.`
            ], `Proxy or firewall suspected.`),
            fl: R(`Per-file issue.`, `Likely`, [`Rename the file or shorten the path.`, `Close the app that has the file locked.`], `Many files affected.`),
            ot: R(`Cause not clear yet.`, `Inconclusive`, [`Record the exact error text.`, `Try the file on the web version to compare.`], `Escalate with the error text.`)
        }
    },
    blk: {
        t: `BitLocker recovery key requested`, kw: `bitlocker recovery key encryption blue screen enter key locked drive tpm`, h: {
            chg: [`Hardware or firmware change`, 1], upd: [`BIOS or update change`, 1], tamp: [`Tampering or theft`, 1]
        }, n: {
            a: Q(`Was there a recent BIOS or firmware update, a hardware change or a boot setting change?`, `Recovery is triggered when the device boot measurements change.`, `Ask the user and check the change record`, 0, `None`, [
                O(`Yes, a known change`, `ch`, `Known firmware, hardware or boot change preceded the prompt`, {
                    chg: 6, upd: 2
                }), O(`No change; device seems unattended`, `ta`, `No known change; unexpected prompt`, { tamp: 5 }), O(`Unknown`, `ch`, `Cause of recovery prompt unknown`, {})
            ]),
            ch: R(`A boot-measurement change is the likely trigger.`, `Likely`, [
                `Verify the user identity per policy before releasing any key.`, `The authorised team retrieves the key from the directory. Never paste a key in a ticket or chat.`, `After unlocking, ask the endpoint team whether the device needs its protectors refreshed.`
            ], `Key retrieval needs authorised staff.`),
            ta: R(`Unexpected recovery. Possible tampering.`, `Possible`, [
                `Do not release the key until identity and device custody are confirmed.`, `Check whether the device was lost or left unattended.`, `Raise a security event if tampering is possible.`
            ], `Escalate to security.`)
        }
    },
    dj: {
        t: `Domain join failure`, kw: `domain join fails cannot join domain trust relationship computer account rename new device`, h: {
            dns: [`DNS not pointing at the domain`, 1], net: [`No route to domain controller`, 1], perm: [`Insufficient join rights`, 1], dup: [`Existing or stale computer account`, 1]
        }, n: {
            a: Q(`What is the exact error message?`, `Domain join errors are specific. Capture the text before testing.`, `Screenshot the error`, 0, `None`, [
                O(`Domain controller could not be contacted`, `b`, `Error: domain controller could not be contacted`, {
                    dns: 5, net: 5
                }), O(`Access denied`, `pr`, `Error: access denied`, { perm: 8 }), O(`Account already exists`, `du`, `Error: computer account already exists`, { dup: 8 })
            ]),
            b: Q(`Does nslookup of the domain name return domain controller addresses, using the configured DNS?`, `Domain join relies on DNS finding the domain controllers.`, `nslookup <domain-name>`, 0, `Standard user`, [
                O(`Returns addresses`, `nw`, `Domain name resolves`, {
                    dns: -4, net: 5
                }), O(`Fails`, `dn`, `Domain name does not resolve`, { dns: 8 })
            ]),
            pr: R(`The account used lacks join rights.`, `Supported`, [
                `Do not borrow other credentials.`, `An authorised person joins the device or delegates rights.`
            ], `Needs a delegated account.`),
            du: R(`An existing computer account is in the way.`, `Supported`, [
                `Check the name is not in use by another device before reusing it.`, `An administrator resets or removes the stale account.`
            ], `Directory changes need an admin.`),
            dn: R(`DNS is not pointing at the domain.`, `Supported`, [
                `Check the DNS server on the adapter with ipconfig /all.`, `Domain-joined machines must use DNS that serves the domain.`
            ], `Network settings are managed centrally.`),
            nw: R(`Name resolves but the controller is not reachable.`, `Possible`, [`Test Test-NetConnection <dc> -Port 389.`, `Check VPN and VLAN assignment.`], `Escalate to networking.`)
        }
    },
    dh: {
        t: `Duplicate IP address or DHCP conflict`, kw: `duplicate ip address conflict dhcp lease static network intermittent disconnect same address`, h: {
            stat: [`Static address inside DHCP range`, 1], rogue: [`Rogue or second DHCP server`, 1], lease: [`Stale lease`, 1]
        }, n: {
            a: Q(`Does Windows report an IP address conflict, or does ipconfig /all show a static address?`, `Static addresses inside a DHCP scope are a classic cause of conflicts.`, `ipconfig /all`, 0, `Standard user`, [
                O(`Conflict message or static address`, `st`, `Address conflict message or static address configured`, { stat: 7 }), O(`Address from DHCP, intermittent loss`, `b`, `Address from DHCP, intermittent problems`, {
                    rogue: 3, lease: 3
                })
            ]),
            b: Q(`Does the DHCP server shown by ipconfig /all match the expected server?`, `An unexpected DHCP server can issue wrong gateways or DNS.`, `ipconfig /all, note DHCP Server`, 0, `Standard user`, [
                O(`Unexpected DHCP server`, `ro`, `Unexpected DHCP server address`, { rogue: 9 }), O(`Expected server`, `ls`, `Expected DHCP server`, { lease: 5 })
            ]),
            st: R(`A static or duplicate address is likely.`, `Likely`, [
                `Record the address and the MAC of the device if the conflict message names it.`, `Switch the device to automatic addressing only if policy allows.`
            ], `Network team resolves the conflicting device.`),
            ro: R(`Possible rogue DHCP server.`, `Escalate`, [`Record the server address and affected devices.`, `Do not unplug devices speculatively.`], `Immediately, to networking.`),
            ls: R(`Stale lease is possible.`, `Possible`, [
                `ipconfig /release then /renew changes the adapter state and briefly drops connectivity; warn the user.`, `Recheck for conflicts.`
            ], `Recurs.`)
        }
    },
    bsod: {
        t: `Blue screen of death`, kw: `blue screen bsod crash stop code restart unexpectedly reboot bugcheck dump`, h: {
            drv: [`Driver fault`, 1], hw: [`Memory or disk hardware`, 1], upd: [`Recent update or software`, 1]
        }, n: {
            a: Q(`What is the stop code, and what changed recently?`, `The stop code and recent changes are the best evidence. Photograph the screen if it recurs.`, `Reliability Monitor or Event Viewer, Critical events (Kernel-Power, BugCheck)`, 0, `Standard user`, [
                O(`Driver-related stop code`, `dr`, `Driver-related stop code`, { drv: 8 }), O(`Memory or disk related code`, `hw`, `Memory or disk related stop code`, { hw: 8 }), O(`Began after an update or install`, `up`, `Started after an update or install`, { upd: 8 }), O(`Unknown`, `un`, `Stop code unknown`, {})
            ]),
            dr: R(`A driver is the likely cause.`, `Likely`, [
                `Record the driver named in the stop code if shown.`, `Roll back or update only through approved channels.`
            ], `Several devices share the model.`),
            hw: R(`Hardware fault possible.`, `Possible`, [
                `Back up data if the disk is suspect.`, `Run vendor diagnostics, not repair tools, on a suspect disk.`
            ], `Hardware replacement.`),
            up: R(`A recent change is the likely trigger.`, `Likely`, [`Uninstall the update or software only if policy allows.`, `Check for known issues.`], `Multiple devices affected after the same update.`),
            un: R(`Not enough evidence yet.`, `Inconclusive`, [
                `Collect stop codes from Event Viewer over a few days.`, `Note any pattern: time, app, peripheral.`
            ], `Crashes continue.`)
        }
    },
    wu: {
        t: `Windows Update failing`, kw: `windows update failing error stuck install failed 0x update fails pending restart`, h: {
            disk: [`Low disk space`, 1], corr: [`Component corruption`, 1], policy: [`Update policy or WSUS`, 1], pend: [`Pending restart`, 1]
        }, n: {
            a: Q(`Is there at least 10 GB free and is a restart pending?`, `Updates need working space and cannot proceed while a restart is pending.`, `Settings, System, Storage`, 0, `Standard user`, [
                O(`Low disk space`, `ds`, `Low free disk space`, { disk: 8 }), O(`Restart pending`, `rp`, `Restart pending`, { pend: 8 }), O(`Space and restart both fine`, `b`, `Disk space fine, no pending restart`, {
                    disk: -3, pend: -3
                })
            ]),
            b: Q(`Does the update history show the same error code each time?`, `A repeating code points at corruption or policy rather than chance.`, `Settings, Windows Update, Update history`, 0, `Standard user`, [
                O(`Same code each time`, `rc`, `Same error code on repeat attempts`, {
                    corr: 5, policy: 3
                }), O(`Varies`, `wt`, `Error code varies`, {})
            ]),
            ds: R(`Low disk space is blocking the update.`, `Likely`, [`Free space by removing user-approved items.`, `Retry the update.`], `Space cannot be freed.`),
            rp: R(`A pending restart is blocking.`, `Likely`, [`Ask the user to save work and restart.`, `Restart interrupts the user; schedule it.`], `Persistent.`),
            rc: R(`Repeating error code. Search the exact code.`, `Supported`, [
                `Record the code and the update number.`, `DISM and sfc checks need admin: DISM /Online /Cleanup-Image /ScanHealth is read-only.`
            ], `Corruption suspected and repair needs admin.`),
            wt: R(`Inconclusive.`, `Inconclusive`, [
                `Collect the codes over several attempts.`, `Check with the update management team for a known issue.`
            ], `Several devices fail.`)
        }
    },
    mon: {
        t: `External monitor not detected`, kw: `monitor display second screen external dock hdmi displayport usb-c no signal detected screen`, h: {
            cab: [`Cable or port`, 1], dock: [`Dock fault or firmware`, 1], drv: [`Display driver`, 1], set: [`Display setting`, 1]
        }, n: {
            a: Q(`Does the monitor work when connected directly to the laptop, bypassing the dock?`, `This isolates the dock from the cable, monitor and laptop.`, `Connect the monitor directly with a known good cable`, 0, `None`, [
                O(`Works directly`, `dk`, `Monitor works when connected directly`, {
                    dock: 8, cab: -2
                }), O(`Still not detected`, `b`, `Monitor not detected when connected directly`, {
                    dock: -3, cab: 3, drv: 3, set: 3
                })
            ]),
            b: Q(`Does pressing Win+P and choosing Extend, or Settings, System, Display, Detect, change anything?`, `Windows may be in the wrong projection mode or not have scanned for the display.`, `Win+P, then Settings, Display, Detect`, 0, `Standard user`, [
                O(`Detects now`, `fx`, `Monitor detected after projection or detect action`, { set: 8 }), O(`Still not detected`, `cb`, `Monitor not detected after projection or detect action`, {
                    cab: 4, drv: 3
                })
            ]),
            dk: R(`The dock or its cable is the likely cause.`, `Supported`, [
                `Check the dock power supply, and replace the cable.`, `Dock firmware updates need approval.`
            ], `Dock replacement.`),
            fx: R(`Display setting or projection mode.`, `Supported`, [
                `Set Extend or Duplicate as the user needs.`, `Check resolution and refresh rate in Advanced display.`
            ], `Not needed.`),
            cb: R(`Cable, port or driver is possible.`, `Possible`, [
                `Try another cable and another monitor.`, `Check the graphics adapter in Device Manager for warnings.`
            ], `Hardware fault.`)
        }
    }
});
