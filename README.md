# cvs-vaccine-appointment-finder
An app that continuously checks CVS for available second dose vaccine appointments. When an appointment is found,
a slack notification will be sent via the associated slack webhook. 

**Only supports Pfizer and Moderna.**

##Installation:
1. `git clone git@github.com:ch0chi/cvs-vaccine-appointment-finder.git`
2. `cd cvs-vaccine-appointment-finder`
3. Copy the .env.example file to a new .env file
   - `cp .env.example .env`
4. Open the .env file and add associated environment variables.
    - Example:
        - SLACK_WEBHOOK_URL="slack webhook url "
        - ADDRESS="Denver, CO." (Use either a zip code or City,State)
        - FIRST_DOSE_DATE="2021-04-01" (Be sure to maintain formatting)
        - VACCINE_TYPE="moderna" (Use either "moderna" or "pfizer" _lowercase only_)
        - REFRESH_TIME=5 (Time, **in seconds only**, that the app will attempt to fetch appointments)
    
**_All environment variables are required before running the container._**
##Usage
`docker-compose up -d`

If any environment variables are changed after the container has been built, you'll have to rebuild the container:
   - `docker-compose down && docker-compose up --build -d`

To view logs:
   - `docker-compose logs -f --tail=100`


##Notes
1. While not required, it's recommended you proxy the container through a vpn.
2. When the application finds an appointment, it will stop until started again.

