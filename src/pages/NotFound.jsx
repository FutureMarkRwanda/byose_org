// eslint-disable-next-line no-unused-vars
import React from 'react';

function NotFound() {
    return (
        <div
            className="min-h-full  flex flex-col gap-5 justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="mb-8">
                    <h2 className="mt-6 text-6xl font-extrabold text-gray-900 ">404</h2>
                    <p className="mt-1 text-3xl font-bold text-gray-900 ">Page not found</p>
                    {/* eslint-disable-next-line react/no-unescaped-entities */}
                    <p className="mt-2 text-sm text-gray-600 ">Sorry, we couldn't find this page&nbsp;
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        you're looking for. <strong>Could still be in progress.</strong></p>
                </div>
                <div className="mt-2">
                    <a href="/home"
                       className="text-white hover:scale-105 active:scale-125 bg-gradient-to-tr from-[#195C51] via-gray-900  to-[#195C51] inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md  focus:outline-none focus:ring-2 focus:ring-offset-2 ">
                        <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M3 12h18m-9-9l9 9-9 9"/>
                        </svg>
                        Go back home
                    </a>
                </div>
            </div>
            <div className="w-full max-w-2xl">
                <div className="relative flex flex-col gap-7">
                    <hr/>
                    <div className="relative flex justify-center">
                        <span className="px-2  text-sm text-gray-500">
                        If you think this is a mistake, please contact support
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotFound;