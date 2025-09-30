const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

module.exports.config = {
  name: "uptime",
  aliases: ["up", "upt"],
  version: "1.2",
  cresit: "ari",
  role: 0,
  category: "System",
};

module.exports.run = async ({ api, event, args }) => {
  const width = 900;
  const height = 500;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const uptime = process.uptime();
  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / (60 * 60)) % 24);
  const days = Math.floor(uptime / (60 * 60 * 24));
  const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  const particles = [];
  for(let i=0;i<150;i++){
    particles.push({
      x: Math.random()*width,
      y: Math.random()*height,
      r: Math.random()*2+1,
      sx: (Math.random()-0.5)*1.2,
      sy: (Math.random()-0.5)*1.2,
      color: `hsl(${Math.random()*360},100%,70%)`
    });
  }

  const rings = [
    { radius: 150, angle: 0, speed: 0.002, color: '#00fff0' },
    { radius: 220, angle: 0, speed: -0.0015, color: '#ff00ff' },
    { radius: 300, angle: 0, speed: 0.001, color: '#00ff99' }
  ];

  const cx = width/2;
  const cy = height/2;

  ctx.fillStyle = '#0f0c29';
  ctx.fillRect(0,0,width,height);

  particles.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 15;
    ctx.fill();
  });
  
  rings.forEach(ring=>{
    ctx.beginPath();
    ctx.arc(cx, cy, ring.radius, ring.angle, ring.angle+Math.PI*1.8);
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = 2;
    ctx.shadowColor = ring.color;
    ctx.shadowBlur = 20;
    ctx.stroke();
  });

  const numLines = 36;
  for(let i=0;i<numLines;i++){
    const angle = (i/numLines)*Math.PI*2;
    const x1 = cx + Math.cos(angle)*350;
    const y1 = cy + Math.sin(angle)*350;
    const x2 = cx + Math.cos(angle)*380;
    const y2 = cy + Math.sin(angle)*380;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.strokeStyle = `hsla(${i*10},100%,70%,0.8)`;
    ctx.lineWidth = 2;
    ctx.shadowColor = `hsla(${i*10},100%,70%,0.8)`;
    ctx.shadowBlur = 20;
    ctx.stroke();
  }

  ctx.font = 'bold 48px Sans';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00fff0';
  ctx.shadowColor = '#00fff0';
  ctx.shadowBlur = 30;
  ctx.fillText('🤖 BOT UPTIME', cx, cy - 100);

  ctx.font = 'bold 56px Sans';
  ctx.fillStyle = '#ff00ff';
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 40;
  ctx.fillText(uptimeString, cx, cy);

  ctx.font = '24px Sans';
  ctx.fillStyle = '#ffffff99';
  ctx.shadowColor = '#ffffff99';
  ctx.shadowBlur = 10;
  ctx.fillText('Stay online, master! 👾', cx, cy + 100);
  
  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(__dirname,'uptime.png');
  fs.writeFileSync(filePath, buffer);

  return api.sendMessage({
    body: 'Here is your futuristic bot uptime:',
    attachment: fs.createReadStream(filePath)
  }, event.threadID);
};
