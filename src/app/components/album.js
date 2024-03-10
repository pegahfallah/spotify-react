import React from 'react';
import Image from 'next/image'

const Album = ({ urls }) => {
    if (!urls || urls.length === 0) {
        return null;
    }

  return (
    <div className="flex">
      {urls.map((url, index) => (
        <div key={index} className="bg-white w-[300px] rounded-md mx-2">
              <img className="rounded-md" src={url} alt={`Album Image ${index + 1}`} />
        </div>
      ))}
          {console.log(urls)}
    </div>
  );
};

export default Album;
