// eslint-disable-next-line no-unused-vars
import React from 'react';

// eslint-disable-next-line react/prop-types,no-unused-vars
function Action({state}) {
    return (
        <div id={`action`} className={`flex flex-col md:p-6 gap-2 text-gray-900 p-4 bg-white`}>
            <h1 className={` text-center font-bold md:mb-14`}>Making Life Simpler and Smarter for Everyone</h1>
            {/*<h2 className={`text-center font-bold`}>EXPANDING POSSIBILITIES</h2>*/}
            <div className={`container md:px-6 mx-auto grid md:grid-cols-2 gap-2`}>
                <div>
                    <img alt="logo" className={`rounded-lg`}
                         src={`https://www.houseper.com/wp-content/uploads/2020/05/system_overview_home-1.jpg`}/>
                </div>
                <p className={`flex items-center md:p-6 p-4 md:text-lg text-lg h-full w-full justify-start `}>
                    <span>At BYOSE, we transform lives through innovation.
                    From smart home automation to advanced robotics,
                    we design solutions that simplify routines, save energy, and empower communities.
                    Our platforms—
                    <a href={`#`} className={`font-semibold italic bg-slate-300 p-1 rounded-md`}>B-Academy</a>,
                    <a href={`#`} className={`font-semibold italic bg-slate-300 p-1 rounded-md`}>B-Store</a>,
                    and <a href={`#`}
                           className={`font-semibold italic bg-slate-300 p-1 rounded-md`}>B-Tech Labs—bring</a> education,
                        commerce, and cutting-edge technology together to create a smarter future for everyone.
                        <button className={`block text-white active:scale-110 m-1 p-3 rounded-full font-medium bg-gradient-to-tr from-[#195C51] via-gray-900  to-[#195C51] hover:bg-gradient-to-tl hover:from-[#195C51] hover:via-gray-900 hover:to-[#195C51] `}>
                            Learn More
                        </button>
                    </span>
                </p>
            </div>
        </div>
    );
}

export default Action;