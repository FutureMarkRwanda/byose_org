// eslint-disable-next-line no-unused-vars
import React from 'react';
import {news} from "../utils/data.js";

// eslint-disable-next-line no-unused-vars,react/prop-types
function News({status}) {
    return (
        <div className={`text-gray-950 bg-gray-100`}>
            <section className="p-4 pt-20 lg:pt-[120px] pb-10 lg:pb-20 ">
                <h2 className={`container mx-auto text-start font-bold pb-5`}>LATEST NEWS</h2>
                <div className="container mx-auto ">
                    <div className="flex flex-wrap -mx-4">
                    {news.map((item) => (
                            <div key={item.id}  className="w-full md:w-1/2 xl:w-1/3 px-4">
                                <div className="bg-white rounded-lg overflow-hidden mb-10">
                                    <img
                                        src={item.image}
                                        alt="image"
                                        className="w-full"
                                    />
                                    <div className="p-8 sm:p-9 md:p-7 xl:p-9 text-center">
                                        <h3>
                                            <a href="#"
                                               className="font-semibold text-dark text-xl sm:text-[22px] md:text-xl lg:text-[22px] xl:text-xl 2xl:text-[22px] mb-4 block hover:text-primary ">
                                                {item.title}
                                            </a>
                                        </h3>
                                        <p className="text-base text-body-color leading-relaxed mb-7">
                                            {item.description}
                                        </p>
                                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                                           className="inline-block py-2 px-7 active:scale-110 text-base text-body-color font-medium hover:text-gray-700 transition ">
                                            Read more →
                                        </a>
                                    </div>
                                </div>
                            </div>
                    ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default News;