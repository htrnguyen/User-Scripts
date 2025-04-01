# Unlock Unlimited Medium

A Tampermonkey/Greasemonkey userscript that automatically unlocks Medium articles and Medium-based publications (like osintteam.blog) using freedium.cfd.

## Features

- 🔓 Automatically unlocks Medium articles and Medium-based publications
- 🎯 Works with medium.com and osintteam.blog domains
- 🔍 Detects Medium articles through URL patterns and Medium logo presence
- 🖱️ Adds an "Unlock" button on Medium article pages
- 📱 Works on both desktop and mobile browsers
- 🎨 Clean and intuitive user interface

## Installation

1. Install a userscript manager:

   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)
   - [Violentmonkey](https://violentmonkey.github.io/)

2. Click the install button below:
   [![Install](https://img.shields.io/badge/Install-UserScript-blue.svg)](https://raw.githubusercontent.com/htrnguyen/User-Scripts/main/Unlock-Unlimited-Medium/unlock-unlimited-medium.user.js)

## Usage

The script will automatically:

- Add an "Unlock" button to Medium article pages
- Intercept clicks on Medium article links and open them through freedium.cfd
- Add a menu command to unlock the current article

### Manual Unlock

- Click the "🔓 Unlock" button on any Medium article page
- Use the "Unlock this Medium Article" menu command in your userscript manager
- Click any Medium article link to automatically unlock it

## Supported Sites

- medium.com
- osintteam.blog
- Any other Medium-based publication

## How It Works

The script uses freedium.cfd to bypass Medium's paywall by prepending the service URL to the original article URL. For example:

```
Original: https://medium.com/article
Unlocked: https://freedium.cfd/https://medium.com/article
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- [freedium.cfd](https://freedium.cfd/) - The service that makes this script possible
- Medium - The platform this script enhances
