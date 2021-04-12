

# cvs-vaccine-appointment-finder
**Added an alpha feature that allows you to search for multiple locations!**

An app that continuously checks CVS for available second dose vaccine appointments. When an appointment is found, a    
slack notification will be sent via the associated slack webhook.

**Only supports Pfizer and Moderna.**

## Installation:

1. `git clone git@github.com:ch0chi/cvs-vaccine-appointment-finder.git`
2. `cd cvs-vaccine-appointment-finder`
3. Copy the .env.example file to a new .env file
    - `cp .env.example .env`
4. Create a `searchAreas.json` file from the example:
    - `cp searchAreas.json.example searchAreas.json`
    - Edit the `searchAreas.json` file and update to match your desired search parameters.
        - You can add as many addresses as you'd like.
        - Use either a zip code or City,State for the `vaccineType`
5. Open the .env file and add associated environment variables.
    - Example:
        - SLACK_WEBHOOK_URL="slack webhook url "
        - REFRESH_TIME=5 (Time, **in seconds only**, that the app will attempt to fetch appointments)

**_All environment variables and search areas are required before running the container._**

## Usage

`docker-compose up -d`

If any environment variables are changed after the container has been built, you'll have to rebuild the container:

- `docker-compose down && docker-compose up --build -d`

To view logs:
- `docker-compose logs -f --tail=100`

## Notes

1. While not required, it's recommended you proxy the container through a vpn.
2. When the application finds an appointment, it will change the refresh time to 10 minutes for that particular location.
3. When an error occurs, it will change the refresh time to 10 minutes for that particular location.
    - *Working on a most robust feature that will dynamically set refresh time.*
