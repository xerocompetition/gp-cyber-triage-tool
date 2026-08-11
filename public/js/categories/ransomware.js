// Ransomware, rules sourced from NCSC ransomware guidance, plus DSPT/ICO cross references.
FLOWS.ransomware = {
    next(a){
      if(a.q1 === undefined) return {key:"q1", text:"Are files encrypted, is a device locked, or is a ransom note or payment demand displayed?",
        options:[{label:"Yes", value:"yes"},{label:"No", value:"no"}]};
      if(a.q1 === "no") return {type:"redirect", text:"This does not sound like ransomware on its own. Go back and choose the category that matches what actually happened."};
      if(a.q2 === undefined) return {key:"q2", text:"Might patient data have been exposed or exfiltrated as part of this attack?",
        options:[{label:"Yes", value:"yes"},{label:"No", value:"no"},{label:"Not sure", value:"unsure"}]};
      return {type:"done"};
    },
    playbook(a){
      const steps = [
        {stage:"contain", text:"Disconnect the affected device from all network connections (wired, wireless and mobile) without powering it off first if this can be avoided.", source:"NCSC ransomware guidance"},
        {stage:"contain", text:"Reset credentials, particularly admin accounts, after checking this will not lock staff out of systems needed for recovery.", source:"NCSC ransomware guidance"},
        {stage:"contain", text:"Do not pay the ransom. NCSC and UK law enforcement do not encourage, endorse or condone payment, there is no guarantee of data return, and the ICO does not treat payment as risk mitigation for any related data breach.", source:"NCSC ransomware guidance and NCSC ransomware payment guidance", critical:true},
      ];
      if(a.q2 !== "no"){
        steps.push({stage:"report", text:"Also work through the personal data breach checklist in parallel, applying the same risk based escalation and 72 hour ICO rules.", source:"Cross reference to ICO and DSPT rules"});
      }
      steps.push({stage:"contain", text:"Once the cause is understood, restore from offline backups rather than reconnecting affected systems immediately.", source:"NCSC ransomware guidance"});
      steps.push({stage:"report", text:"Report to Report Fraud, and to the NCSC where the incident may be of national significance.", source:"NCSC ransomware guidance"});
      steps.push({stage:"escalate", text:"Escalate through the practice's approved incident response route, since this may affect patient safety, clinical services or essential systems. Use the appropriate NHS technical, DSPT, regulatory and patient safety reporting routes according to the nature and impact of the incident.", source:"NHS England, CAF aligned DSPT guidance on risk based escalation"});
      steps.push({stage:"report", text:"Record a logged entry: what happened, who was told, when, and what was decided.", source:"DSPT incident recording requirement"});
      return steps;
    }
};
