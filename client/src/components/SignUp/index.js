import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { TailSpin } from "react-loader-spinner";
import { BASE_URL } from "../../utils/url";
const SignUp = () => {
    const navigate = useNavigate();
    const [pic, setPic] = useState();
    const [picLoading, setPicLoading] = useState(false);
    const [user, setUser] = useState({
        fullName: "",
        email: "",
        password: "",

    });
    useEffect(() => {

        const isLoggedInUser = localStorage.getItem('user:token');
        if (isLoggedInUser) {
            navigate('/');
        }

    }, [])
    const onSignup = async (e) => {
        e.preventDefault();
        try {
            console.log("pic sent", pic);
            const data = { user, pic };
            const res = await fetch(`${BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            const resData = await res.json();

            if (resData.status === 200) {

                navigate("/users/sign_in");
            }
            else {
                toast.error(resData.message);
            }
        } catch (error) {

            console.log(error);
        }


    }
    const postDetails = (pics) => {
        setPicLoading(true);
        toast("Uploading image...", {
            status: "info",
            duration: 5000,
            isClosable: true,
            position: "bottom",
        });
        if (pics === undefined) {
            toast("Please Select an Image!", {
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setPicLoading(false);
            return;
        }
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "ml_default");
            data.append("cloud_name", "dr6qk9jr8");
            fetch("https://api.cloudinary.com/v1_1/dr6qk9jr8/image/upload", {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    setPic(data.url.toString());
                    console.log(data.url.toString(), "image url");
                    setPicLoading(false);
                    toast("Image uploaded successfully!", {
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                        position: "bottom",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    setPicLoading(false);
                });
        } else {
            toast("Please Select an Image!", {
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setPicLoading(false);
            return;
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="bg-white w-full max-w-xl p-10 rounded-3xl shadow-[0_20px_50px_rgba(128,_90,_213,_0.3)]">
                <div className="mb-2 text-center">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-rose-500 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-gray-600 mt-3 text-lg">Begin your journey with us</p>
                </div>

                <form onSubmit={onSignup} className="space-y-2">
                    <div className="space-y-1">
                        <label htmlFor="fullName" className="text-sm font-medium text-gray-700 block">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            value={user.fullName}
                            onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition duration-200 outline-none text-gray-700"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition duration-200 outline-none text-gray-700"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition duration-200 outline-none text-gray-700"
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 block">
                            Profile Picture
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-violet-500 transition duration-200">
                            {!pic && <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-700 focus-within:outline-none">
                                        <span>Upload a file</span>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            className="sr-only"
                                            accept="image/*"
                                            onChange={(e) => postDetails(e.target.files[0])}
                                        />
                                    </label>
                                </div>

                                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            </div>}
                            {
                                pic && (
                                    <div className="relative">
                                        <img src={pic} width={100} height={100} />
                                        <button
                                            onClick={() => setPic(null)}
                                            className="absolute top-0 right-0 bg-red-500 text-white  p-1"
                                            aria-label="Remove picture"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    <div>
                            <button
                                type="submit"
                                className="!w-full !bg-gradient-to-r !from-violet-600 !to-rose-500 !text-white !py-4 !px-6 !rounded-xl !font-medium !hover:opacity-90 !transition !duration-200 !transform !hover:scale-[1.02] !text-lg"
                            >
                                Create Account
                            </button>
                    </div>
                </form>

                <div className="mt-3 text-center">
                    <p className="text-gray-600">
                        Already have an account?{' '}
                        <span
                            onClick={() => navigate("/users/sign_in")}
                            className="text-violet-600 font-semibold cursor-pointer hover:text-violet-700 transition duration-200"
                        >
                            Sign in
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default SignUp