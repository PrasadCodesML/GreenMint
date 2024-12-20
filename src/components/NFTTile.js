import { Link } from "react-router-dom";
import "./NFTCard.css"; // Import the card styles

export default function NFTTile({ data, currAddress }) {
    return (
        <Link to={`/nftPage/${data.tokenId}`} className="nft-card">
        <img src={data.image} alt={data.name} className="nft-image" />
        <div className="details">
            <div className="name">{data.name}</div>
            <div className="description">{data.description}</div>
            <div className="actions">
            {currAddress === data.seller || currAddress === data.owner ? (
                <button className="owned-button">Owned</button>
            ) : (
                <button className="buy-button">Buy</button>
            )}
            </div>
        </div>
        </Link>
    );
    }
