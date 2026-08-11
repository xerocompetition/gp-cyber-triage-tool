// Shared data: category metadata, stage labels, app state, and the FLOWS registry
// that each category file below fills in.
const CATEGORIES = [
  { id:"personal_data_breach", name:"Personal data breach", blurb:"Patient or personal data may have been exposed, lost, or wrongly disclosed.", ready:true },
  { id:"ransomware", name:"Ransomware", blurb:"A device is locked, files are encrypted, or a ransom note has appeared.", ready:true },
  { id:"phishing", name:"Phishing", blurb:"A suspicious email or message was received, opened, or acted on.", ready:true },
  { id:"bec", name:"Business email compromise", blurb:"A fraudulent payment or bank detail change request arrived by email.", ready:true },
  { id:"account_compromise", name:"Account compromise", blurb:"A login or account may have been accessed without authorisation.", ready:false },
  { id:"malware", name:"Malware", blurb:"A device is behaving unusually, or unknown software may have run.", ready:false },
  { id:"lost_device", name:"Lost or stolen device", blurb:"A laptop, tablet, or phone used for practice work is missing.", ready:false },
];

const STAGES = ["escalate","investigate","contain","report"];
const STAGE_LABEL = { escalate:"Escalate", investigate:"Investigate", contain:"Contain", report:"Report" };

let state = { view:"home", categoryId:null, step:0, answers:{}, playbook:[] };
const FLOWS = {};
