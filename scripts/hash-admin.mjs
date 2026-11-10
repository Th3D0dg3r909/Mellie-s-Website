import bcrypt from 'bcryptjs';

if (!process.stdin.isTTY) {
  console.error('Voer dit script uit in een interactieve terminal.');
  process.exit(1);
}

process.stdout.write('Nieuw beheerwachtwoord (invoer verborgen): ');
process.stdin.setRawMode(true);
process.stdin.resume();
let password = '';

process.stdin.on('data', async (data) => {
  for (const char of data.toString('utf8')) {
    if (char === '\u0003') {
      process.stdin.setRawMode(false);
      process.stdout.write('\n');
      process.exit(130);
    }
    if (char === '\r' || char === '\n') {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
      if (password.length < 16) {
        console.error('Gebruik minstens 16 tekens.');
        process.exitCode = 1;
        return;
      }
      console.log(await bcrypt.hash(password, 12));
      password = '';
      return;
    }
    if (char === '\u007f') password = password.slice(0, -1);
    else password += char;
  }
});
