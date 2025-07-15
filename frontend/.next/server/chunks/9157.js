exports.id=9157,exports.ids=[9157],exports.modules={19115:(t,e,a)=>{"use strict";a.d(e,{N:()=>n});var r=a(63874);class i{static{this.DEFAULT_RULES=[{id:"large_single_transaction",name:"Large Single Transaction",description:"Single transaction exceeds threshold",severity:"medium",enabled:!0,threshold:1e3,timeWindow:1,action:"flag"},{id:"rapid_payouts",name:"Rapid Payouts",description:"Multiple payouts in short time period",severity:"high",enabled:!0,threshold:3,timeWindow:24,action:"suspend"},{id:"new_account_high_earnings",name:"New Account High Earnings",description:"New account with unusually high earnings",severity:"high",enabled:!0,threshold:500,timeWindow:168,action:"flag"},{id:"round_number_pattern",name:"Round Number Pattern",description:"High frequency of round number transactions",severity:"low",enabled:!0,threshold:.7,timeWindow:168,action:"flag"},{id:"velocity_spike",name:"Transaction Velocity Spike",description:"Sudden increase in transaction frequency",severity:"medium",enabled:!0,threshold:5,timeWindow:24,action:"flag"}]}async runFraudDetection(){try{console.log("\uD83D\uDD0D Starting fraud detection scan...");let{data:t,error:e}=await this.supabase.from("credit_transactions").select("*").gte("created_at",new Date(Date.now()-6048e5).toISOString()).order("created_at",{ascending:!1});if(e)throw e;let a=[],r=[],i=[],n=this.groupTransactionsByCreator(t||[]);for(let[t,e]of Object.entries(n)){let n=await this.runFraudRules(t,e);a.push(...n);let o=await this.detectSuspiciousActivities(t,e);r.push(...o);let s=await this.calculateFraudScore(t,e);i.push(s)}return console.log(`✅ Fraud detection complete: ${a.length} alerts, ${r.length} suspicious activities`),{alerts:a,suspicious_activities:r,fraud_scores:i}}catch(t){throw console.error("❌ Fraud detection failed:",t),t}}async runFraudRules(t,e){let a=[];for(let r of i.DEFAULT_RULES)if(r.enabled)try{let i=await this.evaluateRule(r,t,e);i&&a.push(i)}catch(t){console.error(`Error evaluating rule ${r.id}:`,t)}return a}async evaluateRule(t,e,a){let r=36e5*t.timeWindow,i=new Date(Date.now()-r),n=a.filter(t=>new Date(t.created_at)>=i);switch(t.id){case"large_single_transaction":let o=n.find(e=>"royalty"===e.transaction_type&&e.amount>t.threshold);if(o)return{id:`${t.id}_${e}_${Date.now()}`,type:"large_transaction",severity:t.severity,description:`Creator received ${o.amount} credits in single transaction`,affected_entity:e,amount:o.amount,detected_at:new Date().toISOString(),status:"new"};break;case"rapid_payouts":let s=n.filter(t=>"payout"===t.transaction_type);if(s.length>=t.threshold)return{id:`${t.id}_${e}_${Date.now()}`,type:"rapid_payouts",severity:t.severity,description:`Creator made ${s.length} payouts in ${t.timeWindow} hours`,affected_entity:e,detected_at:new Date().toISOString(),status:"new"};break;case"new_account_high_earnings":let c=await this.getAccountAge(e);if(c<=7){let a=n.filter(t=>"royalty"===t.transaction_type).reduce((t,e)=>t+e.amount,0);if(a>t.threshold)return{id:`${t.id}_${e}_${Date.now()}`,type:"suspicious_creator",severity:t.severity,description:`New account (${c} days) earned ${a} credits`,affected_entity:e,amount:a,detected_at:new Date().toISOString(),status:"new"}}break;case"round_number_pattern":let l=n.filter(t=>t.amount%100==0&&t.amount>100),d=n.length>0?l.length/n.length:0;if(d>=t.threshold)return{id:`${t.id}_${e}_${Date.now()}`,type:"unusual_pattern",severity:t.severity,description:`${(100*d).toFixed(1)}% of transactions are round numbers`,affected_entity:e,detected_at:new Date().toISOString(),status:"new"};break;case"velocity_spike":let u=await this.calculateNormalVelocity(e),h=n.length/(t.timeWindow/24);if(u>0&&h>u*t.threshold)return{id:`${t.id}_${e}_${Date.now()}`,type:"unusual_pattern",severity:t.severity,description:`Transaction velocity ${h.toFixed(1)}/day vs normal ${u.toFixed(1)}/day`,affected_entity:e,detected_at:new Date().toISOString(),status:"new"}}return null}async detectSuspiciousActivities(t,e){let a=[],r=this.analyzeTimingPatterns(e);r.suspicion_score>.7&&a.push({id:`timing_pattern_${t}_${Date.now()}`,creator_id:t,activity_type:"timing_pattern",description:"Transactions show consistent timing patterns suggesting automation",risk_score:100*r.suspicion_score,evidence:r.evidence,detected_at:new Date().toISOString(),status:"new"});let i=await this.detectCoordinatedActivity(t,e);return i>.6&&a.push({id:`coordination_${t}_${Date.now()}`,creator_id:t,activity_type:"coordinated_activity",description:"Activity patterns suggest coordination with other creators",risk_score:100*i,evidence:[],detected_at:new Date().toISOString(),status:"new"}),a}async calculateFraudScore(t,e){let a=[],r=0,i=await this.getAccountAge(t),n=e.filter(t=>"royalty"===t.transaction_type).reduce((t,e)=>t+e.amount,0),o=30*Math.min((i>0?n/i:0)/50,1);a.push({factor:"account_age_earnings_ratio",score:o,weight:.3}),r+=o;let s=25*this.analyzeTransactionPatterns(e);a.push({factor:"transaction_patterns",score:s,weight:.25}),r+=s;let c=20*this.analyzePayoutBehavior(e);a.push({factor:"payout_behavior",score:c,weight:.2}),r+=c;let l=25*this.analyzeVolumeAnomalies(e);a.push({factor:"volume_anomalies",score:l,weight:.25});let d="low";return(r+=l)>75?d="critical":r>50?d="high":r>25&&(d="medium"),{creator_id:t,overall_score:Math.min(r,100),risk_level:d,contributing_factors:a,last_calculated:new Date().toISOString()}}groupTransactionsByCreator(t){return t.reduce((t,e)=>{let a=e.creator_id||"unknown";return t[a]||(t[a]=[]),t[a].push(e),t},{})}async getAccountAge(t){try{let{data:e}=await this.supabase.from("creator_wallets").select("created_at").eq("creator_id",t).single();if(!e)return 0;let a=Date.now()-new Date(e.created_at).getTime();return Math.floor(a/864e5)}catch{return 0}}async calculateNormalVelocity(t){let e=new Date(Date.now()-2592e6),a=new Date(Date.now()-864e5);try{let{data:r}=await this.supabase.from("credit_transactions").select("created_at").eq("creator_id",t).gte("created_at",e.toISOString()).lt("created_at",a.toISOString());return r?r.length/29:0}catch{return 0}}analyzeTimingPatterns(t){if(t.length<5)return{suspicion_score:0,evidence:[]};let e={};t.forEach(t=>{let a=new Date(t.created_at).getHours();e[a]=(e[a]||0)+1});let a=Object.keys(e).map(Number),r=this.calculateVariance(a);return{suspicion_score:.8*(r<2),evidence:[{hour_distribution:e,variance:r}]}}async detectCoordinatedActivity(t,e){return 0}analyzeTransactionPatterns(t){let e=t.map(t=>t.amount),a=this.calculateVariance(e),r=e.reduce((t,e)=>t+e,0)/e.length;return r>0?Math.min(a/r,1):0}analyzePayoutBehavior(t){let e=t.filter(t=>"payout"===t.transaction_type),a=t.filter(t=>"royalty"===t.transaction_type);if(0===a.length)return 0;let r=0;return e.forEach(t=>{let e=new Date(t.created_at).getTime();a.find(t=>e-new Date(t.created_at).getTime()<36e5)&&r++}),e.length>0?r/e.length:0}analyzeVolumeAnomalies(t){if(t.length<3)return 0;let e=t.map(t=>t.amount),a=e.reduce((t,e)=>t+e,0)/e.length,r=e.filter(t=>t>3*a);return e.length>0?r.length/e.length:0}calculateVariance(t){if(t.length<2)return 0;let e=t.reduce((t,e)=>t+e,0)/t.length;return t.map(t=>Math.pow(t-e,2)).reduce((t,e)=>t+e,0)/t.length}constructor(){this.supabase=(0,r.U)()}}let n=new i},31607:(t,e,a)=>{"use strict";a.d(e,{o:()=>i,q:()=>n});let r=null;r=a(49526);class i{constructor(){if(r){this.fromEmail=process.env.FROM_EMAIL||"alerts@aeon.com",this.adminEmails=process.env.ADMIN_EMAILS?.split(",")||["admin@aeon.com"];try{this.transporter=this.createTransporter()}catch(t){console.warn("Failed to create email transporter:",t),this.transporter=null}}}createTransporter(){if(!r)throw Error("Nodemailer not available");switch(process.env.EMAIL_SERVICE||"sendgrid"){case"sendgrid":return r.createTransport({service:"SendGrid",auth:{user:"apikey",pass:process.env.SENDGRID_API_KEY||""}});case"gmail":return r.createTransport({service:"gmail",auth:{user:process.env.GMAIL_USER||"",pass:process.env.GMAIL_APP_PASSWORD||""}});default:return r.createTransport({host:process.env.SMTP_HOST||"localhost",port:parseInt(process.env.SMTP_PORT||"587"),secure:"true"===process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER||"",pass:process.env.SMTP_PASS||""}})}}async sendAlert(t,e,a){if(!r||!this.transporter)return console.warn("Email sending is server-side only"),!1;try{let r={to:this.adminEmails,subject:`🚨 AEON Alert: ${t}`,text:e,html:this.generateAlertHTML(t,e),attachments:a,priority:"high"};return await this.sendEmail(r),console.log(`📧 Alert email sent: ${t}`),!0}catch(t){return console.error("Failed to send alert email:",t),!1}}async sendExportNotification(t,e,a,r){try{let i=`📊 AEON Export Complete: ${t}`,n=`
Export completed successfully:

Type: ${t}
File: ${e}
Size: ${this.formatFileSize(a)}
Records: ${r.toLocaleString()}
Generated: ${new Date().toISOString()}

Download link: https://smart4technology.com/admin/exports/${e.split("/").pop()}
      `.trim(),o={to:this.adminEmails,subject:i,text:n,html:this.generateExportHTML(t,e,a,r),priority:"normal"};return await this.sendEmail(o),console.log(`📧 Export notification sent: ${t}`),!0}catch(t){return console.error("Failed to send export notification:",t),!1}}async sendDailySummary(t,e,a,r){try{let i=`📈 AEON Daily Summary - ${new Date().toLocaleDateString()}`,n=`
AEON Platform Daily Summary

Revenue: $${(.01*t).toFixed(2)} (${t} credits)
Transactions: ${e.toLocaleString()}
Fraud Alerts: ${a}
Exports Generated: ${r.length}

${r.length>0?`Generated Exports:
${r.map(t=>`• ${t}`).join("\n")}`:""}

Dashboard: https://smart4technology.com/admin/dashboard
      `.trim(),o={to:this.adminEmails,subject:i,text:n,html:this.generateDailySummaryHTML(t,e,a,r),priority:"normal"};return await this.sendEmail(o),console.log("\uD83D\uDCE7 Daily summary email sent"),!0}catch(t){return console.error("Failed to send daily summary:",t),!1}}async sendSystemAlert(t,e,a){try{let r=`🚨 CRITICAL: AEON System Alert - ${t.replace("_"," ").toUpperCase()}`,i=`
CRITICAL SYSTEM ALERT

Type: ${t}
Message: ${e}
Time: ${new Date().toISOString()}

${a?`Details:
${JSON.stringify(a,null,2)}`:""}

Immediate action required!
Admin Dashboard: https://smart4technology.com/admin/dashboard
      `.trim(),n={to:this.adminEmails,subject:r,text:i,html:this.generateSystemAlertHTML(t,e,a),priority:"high"};return await this.sendEmail(n),console.log(`📧 System alert sent: ${t}`),!0}catch(t){return console.error("Failed to send system alert:",t),!1}}async sendCustomEmail(t){try{return await this.sendEmail(t),console.log(`📧 Custom email sent to ${Array.isArray(t.to)?t.to.join(", "):t.to}`),!0}catch(t){return console.error("Failed to send custom email:",t),!1}}async sendEmail(t){let e={from:this.fromEmail,to:Array.isArray(t.to)?t.to.join(", "):t.to,subject:t.subject,text:t.text,html:t.html,attachments:t.attachments,priority:t.priority||"normal"};await this.transporter.sendMail(e)}generateAlertHTML(t,e){return`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AEON Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { background: #374151; color: white; padding: 10px; text-align: center; }
        .alert-icon { font-size: 48px; margin-bottom: 10px; }
        .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="alert-icon">🚨</div>
            <h1>AEON Security Alert</h1>
            <h2>${t}</h2>
        </div>
        <div class="content">
            <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${e}</pre>
            <a href="https://smart4technology.com/admin/dashboard" class="button">View Admin Dashboard</a>
        </div>
        <div class="footer">
            <p>AEON Platform Security System | ${new Date().toISOString()}</p>
        </div>
    </div>
</body>
</html>
    `.trim()}generateExportHTML(t,e,a,r){return`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AEON Export Complete</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { background: #374151; color: white; padding: 10px; text-align: center; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #059669; }
        .button { background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Export Complete</h1>
            <h2>${t}</h2>
        </div>
        <div class="content">
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">${r.toLocaleString()}</div>
                    <div>Records</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${this.formatFileSize(a)}</div>
                    <div>File Size</div>
                </div>
            </div>
            <p><strong>File:</strong> ${e.split("/").pop()}</p>
            <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
            <a href="https://smart4technology.com/admin/exports" class="button">Download Export</a>
        </div>
        <div class="footer">
            <p>AEON Platform Export System</p>
        </div>
    </div>
</body>
</html>
    `.trim()}generateDailySummaryHTML(t,e,a,r){return`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AEON Daily Summary</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .footer { background: #374151; color: white; padding: 10px; text-align: center; }
        .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
        .metric { background: white; padding: 15px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .exports-list { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📈 Daily Summary</h1>
            <h2>${new Date().toLocaleDateString()}</h2>
        </div>
        <div class="content">
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">$${(.01*t).toFixed(2)}</div>
                    <div>Revenue</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${e.toLocaleString()}</div>
                    <div>Transactions</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${a}</div>
                    <div>Fraud Alerts</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${r.length}</div>
                    <div>Exports</div>
                </div>
            </div>
            ${r.length>0?`
            <div class="exports-list">
                <h3>Generated Exports:</h3>
                <ul>
                    ${r.map(t=>`<li>${t}</li>`).join("")}
                </ul>
            </div>
            `:""}
            <a href="https://smart4technology.com/admin/dashboard" class="button">View Dashboard</a>
        </div>
        <div class="footer">
            <p>AEON Platform Daily Report</p>
        </div>
    </div>
</body>
</html>
    `.trim()}generateSystemAlertHTML(t,e,a){return`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>AEON System Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { background: #fef2f2; padding: 20px; border: 2px solid #dc2626; }
        .footer { background: #374151; color: white; padding: 10px; text-align: center; }
        .alert-icon { font-size: 48px; margin-bottom: 10px; }
        .details { background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="alert-icon">🚨</div>
            <h1>CRITICAL SYSTEM ALERT</h1>
            <h2>${t.replace("_"," ").toUpperCase()}</h2>
        </div>
        <div class="content">
            <p><strong>Message:</strong> ${e}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            ${a?`
            <div class="details">
                <h3>Details:</h3>
                <pre>${JSON.stringify(a,null,2)}</pre>
            </div>
            `:""}
            <p style="color: #dc2626; font-weight: bold;">⚠️ IMMEDIATE ACTION REQUIRED ⚠️</p>
            <a href="https://smart4technology.com/admin/dashboard" class="button">Emergency Dashboard</a>
        </div>
        <div class="footer">
            <p>AEON Platform Emergency Alert System</p>
        </div>
    </div>
</body>
</html>
    `.trim()}formatFileSize(t){if(0===t)return"0 Bytes";let e=Math.floor(Math.log(t)/Math.log(1024));return parseFloat((t/Math.pow(1024,e)).toFixed(2))+" "+["Bytes","KB","MB","GB"][e]}async testConnection(){try{return await this.transporter.verify(),console.log("✅ Email configuration is valid"),!0}catch(t){return console.error("❌ Email configuration failed:",t),!1}}}let n=new i},44369:(t,e,a)=>{"use strict";a.d(e,{E:()=>s});var r=a(63874),i=a(19115),n=a(31607);class o{static{this.DEFAULT_THRESHOLDS={large_transaction:5e3,rapid_payout_count:3,rapid_payout_window:24,new_account_earnings:1e3,velocity_multiplier:10,risk_score_threshold:75}}constructor(t=o.DEFAULT_THRESHOLDS){this.thresholds=t,this.supabase=(0,r.U)(),this.emailer=new n.o}async checkForFraud(){let t=new Date().toISOString();console.log("\uD83D\uDD0D Starting fraud monitoring scan...");try{let e=new Date(Date.now()-864e5),{data:a,error:r}=await this.supabase.from("credit_transactions").select("*").gte("created_at",e.toISOString()).order("created_at",{ascending:!1});if(r)throw r;let n=[],o=[],s=await this.detectLargeTransactions(a||[]);n.push(...s);let c=await this.detectRapidPayouts(a||[]);n.push(...c);let l=await this.detectSuspiciousPatterns(a||[]);n.push(...l);let d=await this.detectMultiAccountFraud(a||[]);n.push(...d);let u=await this.detectVelocitySpikes(a||[]);n.push(...u);let h=(await i.N.runFraudDetection()).fraud_scores.filter(t=>t.overall_score>=this.thresholds.risk_score_threshold);for(let t of h)n.push({id:`high_risk_${t.creator_id}_${Date.now()}`,severity:t.risk_level,type:"suspicious_pattern",creator_id:t.creator_id,description:`Creator has high fraud risk score: ${t.overall_score}/100`,evidence:t.contributing_factors,detected_at:new Date().toISOString(),status:"new",auto_action:t.overall_score>=90?"suspend":"flag"});for(let t of n.filter(t=>"critical"===t.severity)){let e=await this.takeAutomatedAction(t);e&&o.push(e)}let p=n.filter(t=>"high"===t.severity||"critical"===t.severity);p.length>0&&await this.sendFraudAlert(p);let g={scan_start:t,scan_end:new Date().toISOString(),transactions_scanned:a?.length||0,creators_analyzed:new Set(a?.map(t=>t.creator_id).filter(Boolean)).size,alerts_generated:n.length,high_risk_creators:h.length,auto_actions_taken:o.length};return console.log(`✅ Fraud scan complete: ${n.length} alerts, ${o.length} actions taken`),{alerts:n,stats:g,actions_taken:o}}catch(t){throw console.error("❌ Fraud monitoring failed:",t),t}}async detectLargeTransactions(t){let e=[];for(let a of t.filter(t=>"royalty"===t.transaction_type&&t.amount>this.thresholds.large_transaction))e.push({id:`large_tx_${a.id}`,severity:a.amount>2*this.thresholds.large_transaction?"critical":"high",type:"large_transaction",creator_id:a.creator_id,amount:a.amount,description:`Large transaction detected: ${a.amount} credits`,evidence:[{transaction:a}],detected_at:new Date().toISOString(),status:"new",auto_action:"flag"});return e}async detectRapidPayouts(t){let e=[],a={};for(let[r,i]of(t.filter(t=>"payout"===t.transaction_type).forEach(t=>{a[t.creator_id]||(a[t.creator_id]=[]),a[t.creator_id].push(t)}),Object.entries(a)))i.length>=this.thresholds.rapid_payout_count&&e.push({id:`rapid_payout_${r}_${Date.now()}`,severity:i.length>=2*this.thresholds.rapid_payout_count?"critical":"high",type:"rapid_payouts",creator_id:r,description:`Rapid payouts detected: ${i.length} payouts in ${this.thresholds.rapid_payout_window} hours`,evidence:i,detected_at:new Date().toISOString(),status:"new",auto_action:"suspend"});return e}async detectSuspiciousPatterns(t){let e=[],a={};for(let[r,i]of(t.forEach(t=>{t.creator_id&&(a[t.creator_id]||(a[t.creator_id]=[]),a[t.creator_id].push(t))}),Object.entries(a))){let t=i.filter(t=>t.amount%100==0&&t.amount>100),a=i.length>0?t.length/i.length:0;a>.8&&i.length>=5&&e.push({id:`round_pattern_${r}_${Date.now()}`,severity:"medium",type:"suspicious_pattern",creator_id:r,description:`Suspicious round number pattern: ${(100*a).toFixed(1)}% of transactions`,evidence:[{round_ratio:a,transactions:t}],detected_at:new Date().toISOString(),status:"new",auto_action:"flag"});let n=i.map(t=>new Date(t.created_at).getHours()),o=new Set(n);o.size<=2&&i.length>=10&&e.push({id:`timing_pattern_${r}_${Date.now()}`,severity:"medium",type:"suspicious_pattern",creator_id:r,description:`Suspicious timing pattern: transactions only at ${Array.from(o).join(", ")} hours`,evidence:[{hour_distribution:n}],detected_at:new Date().toISOString(),status:"new",auto_action:"flag"})}return e}async detectMultiAccountFraud(t){let e=[],a={};t.forEach(t=>{t.creator_id&&(a[t.creator_id]||(a[t.creator_id]={amounts:[],times:[]}),a[t.creator_id].amounts.push(t.amount),a[t.creator_id].times.push(new Date(t.created_at).getHours()))});let r=Object.keys(a);for(let t=0;t<r.length;t++)for(let i=t+1;i<r.length;i++){let n=r[t],o=r[i],s=a[n],c=a[o],l=this.calculateSimilarity(s.amounts,c.amounts),d=this.calculateSimilarity(s.times,c.times);l>.8&&d>.8&&e.push({id:`multi_account_${n}_${o}_${Date.now()}`,severity:"high",type:"multi_account",creator_id:n,description:`Potential multi-account fraud detected between ${n} and ${o}`,evidence:[{related_creator:o,amount_similarity:l,timing_similarity:d}],detected_at:new Date().toISOString(),status:"new",auto_action:"flag"})}return e}async detectVelocitySpikes(t){let e=[],a={};for(let[r,i]of(t.forEach(t=>{t.creator_id&&(a[t.creator_id]=(a[t.creator_id]||0)+1)}),Object.entries(a))){let t=await this.getHistoricalVelocity(r);t>0&&i>t*this.thresholds.velocity_multiplier&&e.push({id:`velocity_spike_${r}_${Date.now()}`,severity:i>t*this.thresholds.velocity_multiplier*2?"critical":"high",type:"velocity_spike",creator_id:r,description:`Velocity spike detected: ${i} vs normal ${t} transactions/day`,evidence:[{current_velocity:i,historical_velocity:t}],detected_at:new Date().toISOString(),status:"new",auto_action:"flag"})}return e}async takeAutomatedAction(t){try{switch(t.auto_action){case"suspend":return console.log(`🚫 AUTO-SUSPEND: Creator ${t.creator_id} suspended due to ${t.type}`),`Suspended creator ${t.creator_id}`;case"block":return console.log(`🛑 AUTO-BLOCK: Creator ${t.creator_id} blocked due to ${t.type}`),`Blocked creator ${t.creator_id}`;case"flag":return console.log(`🚩 AUTO-FLAG: Creator ${t.creator_id} flagged due to ${t.type}`),`Flagged creator ${t.creator_id}`;default:return null}}catch(t){return console.error("Failed to take automated action:",t),null}}async sendFraudAlert(t){try{let e=`🚨 AEON Fraud Alert - ${t.length} Critical Issues Detected`,a=t.map(t=>`• ${t.severity.toUpperCase()}: ${t.description} (Creator: ${t.creator_id})`).join("\n"),r=`
AEON Fraud Detection Alert

${t.length} critical fraud alerts detected:

${a}

Please review the admin dashboard immediately:
https://smart4technology.com/admin/dashboard

Time: ${new Date().toISOString()}
      `.trim();await this.emailer.sendAlert(e,r),console.log(`📧 Fraud alert email sent for ${t.length} alerts`)}catch(t){console.error("Failed to send fraud alert email:",t)}}async getHistoricalVelocity(t){try{let e=new Date(Date.now()-2592e6),a=new Date(Date.now()-864e5),{data:r}=await this.supabase.from("credit_transactions").select("created_at").eq("creator_id",t).gte("created_at",e.toISOString()).lt("created_at",a.toISOString());return r?r.length/29:0}catch{return 0}}calculateSimilarity(t,e){if(0===t.length||0===e.length)return 0;let a=new Set(t),r=new Set(e),i=new Set([...a].filter(t=>r.has(t))),n=new Set([...a,...r]);return i.size/n.size}}let s=new o},63874:(t,e,a)=>{"use strict";a.d(e,{U:()=>i});var r=a(23405);let i=()=>(0,r.createBrowserClient)("https://iqcwwufogdoaiuzyqney.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxY3d3dWZvZ2RvYWl1enlxbmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjUwNTIsImV4cCI6MjA2Nzk0MTA1Mn0.3ltBkJWpgrzwu0Rlrdj9LmoNbnk7cki_2B9y1x6HlWs")},78335:()=>{},96487:()=>{}};