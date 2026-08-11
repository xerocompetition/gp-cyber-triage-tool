// Business email compromise, rules sourced from NCSC business payment fraud guidance.
FLOWS.bec = {
    next(a){
      if(a.q1 === undefined) return {key:"q1", text:"Was this a request, received by email, to make a payment, change bank or payee details, or send sensitive information, that turned out to be fraudulent and appeared to come from a colleague, supplier, or someone senior in the practice?",
        options:[{label:"Yes", value:"yes"},{label:"No", value:"no"}]};
      if(a.q1 === "no") return {type:"redirect", text:"This does not sound like business email compromise on its own. Go back and choose the category that matches what actually happened."};
      if(a.q2 === undefined) return {key:"q2", text:"Has the payment already been sent, or is one about to be released?",
        options:[{label:"Not sent yet", value:"not_sent"},{label:"Already sent", value:"sent"}]};
      if(a.q3 === undefined) return {key:"q3", text:"Is there no IT department or person, or does the email account itself look compromised rather than just impersonated?",
        options:[{label:"Yes", value:"yes"},{label:"No", value:"no"}]};
      if(a.q4 === undefined) return {key:"q4", text:"Does the compromised mailbox or correspondence contain identifiable patient information?",
        options:[{label:"Yes", value:"yes"},{label:"No", value:"no"}]};
      return {type:"done"};
    },
    playbook(a){
      const steps = [];
      if(a.q2 === "not_sent"){
        steps.push({stage:"contain", text:"Stop the payment before release. Verify the request directly with the supplier or colleague using a phone number or contact route already held by the practice, never a number or reply address taken from the suspicious email.", source:"NCSC, Business payment fraud, how do I know if I'm a victim"});
      } else {
        steps.push({stage:"contain", text:"Contact the bank directly and immediately, using the bank's own official website or phone number rather than anything in the email. The bank may be able to stop or reverse the transfer.", source:"NCSC, Business payment fraud, what action should I take"});
      }
      steps.push({stage:"escalate", text:"Report it to the practice's IT department or person as soon as possible.", source:"NCSC, Business payment fraud, what action should I take"});
      if(a.q3 === "yes"){
        steps.push({stage:"contain", text:"Follow account recovery steps rather than the payment fraud steps alone, and treat this in parallel as an account compromise.", source:"NCSC, Business payment fraud + cross reference to account compromise category"});
      }
      steps.push({stage:"report", text:"Report the incident at gov.uk/report-cyber.", source:"NCSC, Business payment fraud, report it"});
      steps.push({stage:"escalate", text:"Escalate through the practice's approved incident response route, since this may affect sensitive information or essential systems. Use the appropriate NHS technical, DSPT, regulatory and patient safety reporting routes according to the nature and impact of the incident.", source:"NHS England, CAF aligned DSPT guidance on risk based escalation"});
      if(a.q4 === "yes"){
        steps.push({stage:"report", text:"Also work through the personal data breach checklist in parallel, applying the existing 72 hour ICO rule.", source:"Cross reference to ICO and DSPT rules"});
      }
      steps.push({stage:"report", text:"Record a logged entry: what happened, the amount and account involved if a payment was made, who was notified, when, and the outcome of contacting the bank and IT.", source:"DSPT incident recording requirement"});
      return steps;
    }
};
