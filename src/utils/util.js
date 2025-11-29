import axios from "axios";
import init from "../init";

export const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const result = date.toISOString().substring(0, 10);
    return result;
};

export const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const convertJavaLocalDateTimeToDate = (arr) => {
    if (!arr || arr.length === 0) return 'No Date';
    const [year, month, day, hour = 0, minute = 0, second = 0] = arr;
    const date = new Date(year, month - 1, day, hour, minute, second);
    console.log(date);
    return date.toDateString();
};

export async function getMyIPSafe() {
    const response = await axios
      .get(`/${init.appName}/api/users/user-ip`, {
        headers: {
        //   "Content-Type": "application/json",
          "X-User-Email": appUser.email, // required for backend auth
        },
        timeout: 5000
      });
    return response.data;
}

// getMyIP().then(ip => console.log('Your IP:', ip));

export async function getIPDetails() {
    const response = await axios.get('http://ip-api.com/json', {
        timeout: 5000
    });
    
    return {
        ip: response.data.query,
        country: response.data.country,
        city: response.data.city,
        region: response.data.region,
        timezone: response.data.timezone,
        latitude: response.data.lat,
        longitude: response.data.lon,
        isp: response.data.isp
    };
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

