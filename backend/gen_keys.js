const crypto = require('crypto');
const curve = 'prime256v1';
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: curve });

const pub = publicKey.export({ format: 'jwk' });
const x = Buffer.from(pub.x, 'base64url');
const y = Buffer.from(pub.y, 'base64url');
const pubRaw = Buffer.concat([Buffer.from([0x04]), x, y]);
const vapidPublic = pubRaw.toString('base64url').replace(/=/g, '');

const priv = privateKey.export({ format: 'jwk' });
const d = Buffer.from(priv.d, 'base64url');
const vapidPrivate = d.toString('base64url').replace(/=/g, '');

console.log(vapidPublic);
console.log(vapidPrivate);
