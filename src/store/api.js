import axios from "axios";

let client = axios.create({
    baseURL: "http://140.118.127.164:8000",
    timeout: 10000000000000,
});

export default {
    upload: async (formdata) => {
        return await client.post("upload/", formdata, {
            headers: {"Content-Type": "multipart/form-data" }
        });
    }
};