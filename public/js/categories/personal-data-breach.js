// Personal data breach, rules sourced from the ICO and NHS DSPT.
// See the rule mapping table for the exact clause behind each line.
FLOWS.personal_data_breach = {
    next(a){
      if(a.q1 === undefined) return {key:"q1", text:"Does the incident involve personal or patient information (names, NHS numbers, clinical notes, contact details, appointment data)?",
        options:[{label:"Yes", value:"yes"},{label:"No", value:"no"}]};
      if(a.q1 === "no") return {type:"redirect", text:"This does not sound like a personal data breach on its own. Go back and choose the category that matches what actually happened (for example phishing or ransomware); a data breach can still be logged in parallel if data turns out to be involved."};
      if(a.q2 === undefined) return {key:"q2", text:"How was the data exposed?",
        options:[
          {label:"Email or letter sent to the wrong recipient", value:"wrong_recipient"},
          {label:"Device lost or stolen", value:"device"},
          {label:"Unauthorised access to a system", value:"system"},
          {label:"Verbal disclosure", value:"verbal"},
          {label:"Part of a ransomware or malware incident", value:"ransomware_malware"},
        ]};
      if(a.q3 === undefined) return {key:"q3", text:"Is there a likely risk to the affected people's rights or freedoms, for example because the data is clinical, a large number of patients are affected, or vulnerable people are involved?",
        options:[{label:"Yes, likely risk", value:"likely"},{label:"No, unlikely risk", value:"unlikely"},{label:"Not sure", value:"unsure"}]};
      return {type:"done"};
    },
    playbook(a){
      const steps = [];
      const containMap = {
        wrong_recipient: ["Recall the email if possible, or contact the recipient and ask them to delete it and confirm deletion.", "ICO guide, examples of common scenarios"],
        device: ["Remote wipe the device if that capability exists, and change the passwords of any accounts accessible from it.", "ICO guide, examples of common scenarios"],
        system: ["Revoke or reset the account or access route that was used, and change related passwords.", "ICO guide, examples of common scenarios"],
        verbal: ["Identify who received the disclosed information and record whether it can practically be contained.", "ICO guide, examples of common scenarios"],
        ransomware_malware: ["Follow the ransomware or malware checklist for containment, since this exposure happened as part of that incident.", "Cross reference to ransomware category"],
      };
      const [t,s] = containMap[a.q2];
      steps.push({stage:"contain", text:t, source:s});

      if(a.q3 === "likely" || a.q3 === "unsure"){
        steps.push({stage:"escalate", text:"Escalate to the practice manager and the Caldicott Guardian or authorised information governance lead, using the practice's approved incident response route.", source:"NHS England, CAF aligned DSPT guidance on risk based escalation"});
        steps.push({stage:"report", text:"Prepare an ICO report within 72 hours of becoming aware, including a description of the breach, the approximate number and categories of people and records affected, DPO contact details, likely consequences, and mitigation steps taken.", source:"ICO 72 hour and content requirements"});
        steps.push({stage:"report", text:"If the risk to individuals is high, also prepare direct notification to the affected patients.", source:"ICO guide"});
        if(a.q3 === "unsure") steps.push({stage:"investigate", text:"Treat this as likely risk until the assessment is complete; this is the safer default while uncertain.", source:"Tool default, not a direct quote from ICO"});
      } else {
        steps.push({stage:"report", text:"Log the incident and document the reasoning for not reporting to the ICO.", source:"ICO guide, documentation duty"});
      }
      steps.push({stage:"report", text:"Record a logged entry: what happened, who was told, when, and what was decided.", source:"DSPT incident recording requirement"});
      return steps;
    }
};
