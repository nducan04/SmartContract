import React from "react";
import blockies from "ethereum-blockies-base64";

const Blockies = ({ seed, className }) => {
  if (!seed) return null;
  const dataUrl = blockies(seed.toLowerCase());

  return (
    <img
      src={dataUrl}
      alt="Identicon"
      className={className || "identicon"}
    />
  );
};

export default Blockies;
