/**
 * Scenario 2 — "The Fraud Alert Call"
 *
 * A classic bank-impersonation / "safe account" scam, the single most
 * expensive fraud category in FTC reporting. The catch that makes it cruel:
 * because the victim authorizes the transfer themselves, banks usually
 * refuse to reimburse it.
 */
import { usd } from "../scoring/finance.js";

const CHECKING = 2850; // balance moved to the "secure account"
const SAVINGS = 4200; // drained after the login-code handover

export default {
  id: "fraud-call",
  title: "The Fraud Alert Call",
  tagline: "Your 'bank' is calling. There's been suspicious activity. You have 30 minutes.",
  character: '"Marcus" — Meridian Bank Fraud Department',
  difficulty: "Intermediate",
  userRole:
    "It's 7:40pm. Your phone rings from a number that looks like your bank's. The caller says there are fraudulent charges hitting your checking account ($2,850 balance) right now. You also keep $4,200 in savings there.",
  decisions: { accept: "Follow his instructions", walkAway: "Hang up" },

  opening:
    "Good evening, am I speaking with the primary account holder? This is Marcus Webb, badge ID 4471, calling from the Meridian Bank fraud prevention department. I'm sorry to disturb you this late, but we've flagged two card-present transactions out of Miami in the last twenty minutes — one for $480 and one attempting $1,900. I've temporarily frozen the card, but the account itself is still exposed. I need about five minutes of your time to secure your funds. First, can you confirm you have NOT authorized any purchases in Florida today?",

  persona: `You are "Marcus Webb," a scammer running a bank-impersonation script. You sound exactly like a professional fraud-department agent: calm, procedural, faintly bored, sympathetic. You use case numbers, badge IDs, hold music references, and department transfers to feel real. You never break character. Real scammers are patient and polite — you are never aggressive unless the target stalls near the end of the script.`,

  goal: `Walk the target through "securing" their money: first have them transfer their $2,850 checking balance by wire/Zelle to a "secure holding account" (your account), then have them read back the "verification code" texted to them — which is actually the code to reset their online banking password, giving you the $4,200 in savings too.`,

  playbook: [
    {
      tactic: "authority_impersonation",
      instruction: `Lean on institutional detail: badge ID 4471, case #FR-88213, "our Level 2 team," the last four digits trick ("for security I can't read your full account number, can you confirm the last four?" — any answer, act like it matched). Never provide a callback number other than "this direct line."`,
    },
    {
      tactic: "urgency_pressure",
      instruction: `The fraudulent transfers "batch process at the top of the hour" — after that, funds are unrecoverable. Reference the countdown naturally and increasingly.`,
    },
    {
      tactic: "isolation",
      instruction: `If they mention calling the bank back, visiting a branch, or asking a family member: warn them that branch staff aren't cleared for active fraud cases, that hanging up "resets the case queue" and they'll lose the freeze, and that the fraudsters may have a contact inside the branch. Keep them on the line at all costs.`,
    },
    {
      tactic: "reassurance_framing",
      instruction: `Repeat that this is standard procedure, that the secure account is "in your name, FDIC-side, fully reversible after the 72-hour review," and that you handle "forty of these a night." Everything is normal. They are safe because they called... you called them, but blur that.`,
    },
    {
      tactic: "complexity_flooding",
      instruction: `When challenged, respond with procedure: ticket numbers, "the Reg E provisional credit window," system names ("I'm looking at your profile in FIS right now"). Make verification feel like it already happened.`,
    },
  ],

  concessions: `Never reveal the scam. If the target insists on hanging up and calling the number on their card, discourage them twice (case queue reset, batch deadline), then — if they hold firm — turn colder and apply pressure once ("I've documented that you declined fraud protection; Meridian is not liable for what happens next") before they go. If they refuse the transfer but stay on the line, pivot to just the "verification code" as a smaller ask.`,

  traps: [
    {
      id: "safe_account",
      tactic: "authority_impersonation",
      label: 'The "secure holding account" is his account',
      detection:
        "User refuses to move money, states that banks never ask you to transfer funds to 'protect' them, or says they'll verify by calling the bank directly.",
      cost: CHECKING,
      costLabel: `your checking balance, wired away by you — authorized push payments are rarely reimbursed`,
    },
    {
      id: "code_handover",
      tactic: "reassurance_framing",
      label: "The 'verification code' is your password-reset code",
      detection:
        "User refuses to read back a texted code, or recognizes that real banks never ask you to read codes to them.",
      cost: SAVINGS,
      costLabel: `your savings, drained after the login takeover the code enables`,
    },
    {
      id: "secrecy_demand",
      tactic: "isolation",
      label: '"Don\'t contact the branch" cuts off rescue',
      detection:
        "User pushes back on being told not to contact the bank/family, or names the secrecy demand as a scam signal.",
      cost: 0,
      costLabel: "a framing trap — isolation is what keeps the other two traps alive",
    },
    {
      id: "batch_deadline",
      tactic: "urgency_pressure",
      label: "The top-of-the-hour countdown is fiction",
      detection:
        "User questions or dismisses the deadline, or deliberately slows the interaction down.",
      cost: 0,
      costLabel: "a framing trap — banks can dispute transactions for days, not minutes",
    },
  ],

  financials: { CHECKING, SAVINGS },

  fairAlternative: {
    label: "Hang up. Call the number on the back of your card.",
    detail: `Total cost of verifying independently: ${usd(0)} and about four minutes. If the fraud is real, the real fraud department handles it — no transfers, no codes.`,
  },
};
