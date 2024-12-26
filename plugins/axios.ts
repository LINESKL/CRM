import axios from 'axios';

export default defineNuxtPlugin(() => {
    const instance = axios.create({
        baseURL: 'http://localhost:8000', // Ваш API URL
    });

    return {
        provide: {
            axios: instance,
        },
    };
});
