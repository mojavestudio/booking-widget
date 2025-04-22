# Unified Booking Interface

A vanilla JavaScript/CSS booking widget that integrates with Google Calendar for scheduling management.

## Features

- Clean, modern booking interface
- Google Calendar integration for availability management
- Responsive design
- Easy to embed in any website

## Setup Instructions

1. Clone this repository
2. Copy `config/.env.example` to `config/.env` and fill in your Google API credentials
3. Set up OAuth 2.0 credentials in Google Cloud Console
4. Enable Google Calendar API for your project
5. Update the `config/credentials.example.json` with your OAuth client ID and secret

## Development

1. Install a local server (e.g., `python -m http.server` or `live-server`)
2. Open `index.html` in your browser
3. Make sure to configure CORS settings if testing locally

## Deployment

1. Build and minify your assets
2. Host the files on your web server
3. Update the Google OAuth redirect URI in your Google Cloud Console
4. Update environment variables with production values

## Security Notes

- Never commit your actual `.env` file or credentials
- Use HTTPS in production
- Implement proper CORS policies
- Follow Google's security best practices for OAuth 