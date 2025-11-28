import { useEffect, useState } from "react"
import init from "./init";
const Test = () => {
    const [hello, setHello] = useState(undefined);
    useEffect(() => {
        const hello = async () => {
            const response = await fetch(`/${init.appName}/api/hello`, {
                method: "GET",
                headers: {
                    "X-User-Email": 'paul.mai@datascience9.com',   // 👈 your Okta email goes here
                },
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const local = await response.json();
            setHello(local);
        }
        hello();
    }, []);
    return (
        <div>{JSON.stringify(hello)}</div>
    )
};
export default Test;