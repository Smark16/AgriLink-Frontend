import React, { useContext, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { AuthContext } from '../Context/AuthContext';
import UseAxios from '../AxiosInstance/AxiosInstance';

const firebaseConfig = {
  apiKey: "AIzaSyCJQ-SjGv69jqL49149JLIATcN1fuHyCHc",
  authDomain: "agrilink-bd5d9.firebaseapp.com",
  projectId: "agrilink-bd5d9",
  storageBucket: "agrilink-bd5d9.firebasestorage.app",
  messagingSenderId: "522333959252",
  appId: "1:522333959252:web:159391699e9444b04629c1",
  measurementId: "G-GG6P760XV5"
};

export const tokenGeneration = () => {
    const { user } = useContext(AuthContext);  
    const axiosInstance = UseAxios();

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);

    // Initialize Firebase Cloud Messaging and get a reference to the service
    const messaging = getMessaging(app);

    const generateToken = async () => {
        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                const currentToken = await getToken(messaging, { 
                    vapidKey: 'BHaNASWk9yTUeQoBGRdCZ9RMvLs89WdF5DxXa9Ywp5S8UGjb9HMhrmQcq75zllWMkvYDYSkctdCmxGtjXqLzCmI' 
                });

                if (currentToken && user) {
                    await axiosInstance.patch(`http://127.0.0.1:8000/agriLink/save_fcm_token/${user.user_id}`, { fcm_token: currentToken })
                        .then(response => {
                            console.log('FCM token saved successfully:', response);
                        })
                        .catch(error => {
                            console.error('Error saving FCM token:', error);
                        });
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            } else {
                console.warn('Notification permission not granted.');
            }
        } catch (err) {
            console.error('An error occurred while retrieving token:', err);
        }
    };

    // Call generateToken when the component mounts
    useEffect(() => {
        generateToken();
    }, []);

    // Call generateToken whenever the user changes (e.g., on login)
    useEffect(() => {
        if (user) {
            generateToken();
        }
    }, [user]); // Dependency on `user` ensures this runs when the user logs in

    return {
        messaging, 
        generateToken
    };
};

export default tokenGeneration;