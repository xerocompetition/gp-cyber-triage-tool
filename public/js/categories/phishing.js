// Phishing, rules sourced from NCSC and NHSmail Support guidance.
FLOWS.phishing = {
    next(a){
      if(a.q1 === undefined) return {key:"q1", text:"What actually happened?",
        options:[
          {label:"Message received, nothing clicked or entered", value:"nothing"},
          {label:"A link was opened or an attachment was run", value:"link"},
          {label:"Credentials or personal details were entered", value:"creds"},
          {label:"Banking or payment details were shared", value:"bank"},
        ]};
      if(a.q2 === undefined) return {key:"q2", text:"Does this involve an NHSmail account, and is it a highly targeted case: impersonation of a senior NHS individual or organisation, mandate fraud, or a specific threat to NHS cyber security?",
        options:[{label:"Yes, escalated case", value:"escalated"},{label:"No, standard suspicious email", value:"standard"}]};
      if(a.q3 === undefined) return {key:"q3", text:"Was any money lost, or was an account outside NHSmail compromised as a result?",
        options:[{label:"Yes", value:"yes"},{label:"No", value:"no"}]};
      if(a.q4 === undefined) return {key:"q4", text:"Might patient data have been exposed through the credentials entered or the account accessed?",
        options:[{label:"Yes", value:"yes"},{label:"No", value:"no"}]};
      return {type:"done"};
    },
    playbook(a){
      const steps = [];
      const map = {
        nothing: ["No technical remediation is needed, but the email should still be reported.", "NCSC, Phishing, respond and recover section"],
        link: ["Run a full antivirus scan on the device and allow it to clean up anything found. If malware is suspected rather than confirmed clean, also treat this as a possible malware incident.", "NCSC, Phishing, respond and recover section"],
        creds: ["Change the password on this account and on any other account reusing the same password, and enable MFA where it is not already active.", "NCSC, Phishing, respond and recover section"],
        bank: ["Contact the bank immediately, and cancel the card online if online banking is available.", "NCSC, Phishing, respond and recover section"],
      };
      const [t,s] = map[a.q1];
      steps.push({stage:"contain", text:t, source:s});

      if(a.q2 === "standard"){
        steps.push({stage:"report", text:"Use the Report Phishing button in Outlook or Outlook Web App, or forward the email as an attachment to spamreports@nhs.net.", source:"NHSmail Support, Reporting Cyber Threats"});
      } else {
        steps.push({stage:"report", text:"Log this as an urgent cyber security incident through ServiceNow, or call the NHS Cyber Security Operations Centre on 0300 303 5222 (24 hours), since it meets the escalated criteria. This does not replace reporting to spamreports@nhs.net for the underlying phishing email, or fulfil any separate DSPT, ICO or NIS obligation.", source:"NHSmail Support, Reporting Cyber Threats"});
      }
      if(a.q3 === "yes"){
        steps.push({stage:"report", text:"Report to Report Fraud on reportfraud.police.uk or 0300 123 2040 (England, Wales, Northern Ireland), or to Police Scotland on 101.", source:"NCSC, Report a scam email"});
      }
      if(a.q4 === "yes"){
        steps.push({stage:"report", text:"Also work through the personal data breach checklist in parallel, applying the existing 72 hour ICO rule.", source:"Cross reference to ICO and DSPT rules"});
      }
      steps.push({stage:"report", text:"Record a logged entry: what happened, what was clicked or entered, who was told, when, and what action was taken.", source:"DSPT incident recording requirement"});
      return steps;
    }
};
