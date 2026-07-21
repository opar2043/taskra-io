import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaStar,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaCube,
  FaPlus,
} from "react-icons/fa";

const ProposalCard = ({
  p,
  job,
  currentUser,
  isClient,
  handleMessage,
  handleEdit,
  handleDelete,
  handleAccept,
  timeAgo,
  acceptedProposal,
}) => {
  const isTiered = p.proposalType === "tiered" && p.packages?.length > 0;

  const [selectedPkg, setSelectedPkg] = useState(p.packages?.[0]?.id || null);
  const [selectedAddons, setSelectedAddons] = useState([]);

  const currentPkg = isTiered ? p.packages.find((pkg) => pkg.id === selectedPkg) : null;
  const packagePrice = isTiered ? Number(currentPkg?.price || 0) : Number(p.bid || 0);

  const addonsPrice = selectedAddons.reduce((sum, aId) => {
    const a = p.addons?.find((ad) => ad.id === aId);
    return sum + Number(a?.price || 0);
  }, 0);

  const finalPrice = packagePrice + addonsPrice;

  const toggleAddon = (aId) => {
    if (selectedAddons.includes(aId)) setSelectedAddons(selectedAddons.filter((id) => id !== aId));
    else setSelectedAddons([...selectedAddons, aId]);
  };

  const onAccept = () => {
    const pkgName = isTiered ? currentPkg?.name : "Standard";
    const addonNames = selectedAddons.map((aId) => p.addons?.find((a) => a.id === aId)?.name);
    handleAccept(p, finalPrice, pkgName, addonNames);
  };

  return (
    <div
      className={`border rounded-2xl p-5 transition-all ${
        p.accepted
          ? "bg-success-bg/50 border-success-text/40 shadow-md"
          : "border-line hover:border-primary/50 hover:shadow-md"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div className="flex gap-4">
          <Link to={`/view-freelencer/${p.freelancer_id}`}>
            <img
              src={p.freelancer_photo || "https://placehold.co/150"}
              alt={p.freelancer_name}
              className="w-14 h-14 rounded-xl object-cover border border-line hover:border-primary transition"
            />
          </Link>
          <div>
            <Link
              to={`/view-freelencer/${p.freelancer_id}`}
              className="font-bold text-ink hover:text-primary transition text-lg"
            >
              {p.freelancer_name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-body-text flex items-center gap-1 font-medium">
                <FaMapMarkerAlt className="text-xs text-primary" /> {p.freelancer_location}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-primary text-xs" />
                ))}
              </div>
              <span className="text-xs text-body-text font-medium">(4.8)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          {!isClient && (
            <button
              onClick={() => handleMessage(p.freelancer_id)}
              className="text-xs font-bold px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-hover transition"
            >
              Message Me
            </button>
          )}
          <div className="text-right">
            <p className="text-xs text-body-text mb-1 font-medium">Total Bid</p>
            <span className="text-2xl font-bold text-primary">£{finalPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            {currentUser?._id === p.freelancer_id && !p.accepted && (
              <>
                <button
                  onClick={() => handleEdit(p)}
                  className="w-9 h-9 flex items-center justify-center bg-primary-tint text-primary rounded-xl hover:bg-primary hover:text-white transition"
                  title="Edit proposal"
                >
                  <FaEdit className="text-sm" />
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="w-9 h-9 flex items-center justify-center bg-danger-bg text-danger-text rounded-xl hover:bg-danger-text hover:text-white transition"
                  title="Delete proposal"
                >
                  <FaTrash className="text-sm" />
                </button>
              </>
            )}
            {currentUser?._id === job.client_id && !p.accepted && !acceptedProposal && (
              <button onClick={onAccept} className="btn-pill !py-2 !px-5 text-sm">
                <FaCheckCircle /> Accept
              </button>
            )}
            {p.accepted && (
              <span className="flex items-center gap-1 text-success-text text-xs font-bold bg-success-bg px-3 py-2 rounded-full">
                <FaCheckCircle /> Accepted
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-cream rounded-xl p-4 mb-3 border border-line">
        <p className="text-sm text-body-text leading-relaxed">{p.comment}</p>
      </div>

      {isTiered && (
        <div className="mt-4 pt-4 border-t border-line">
          <h4 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
            <FaCube className="text-primary" /> Select a Package
          </h4>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            {p.packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => isClient && !p.accepted && setSelectedPkg(pkg.id)}
                className={`p-4 border rounded-2xl transition-all ${
                  isClient && !p.accepted ? "cursor-pointer hover:border-primary" : ""
                } ${
                  selectedPkg === pkg.id ? "border-primary bg-primary-tint" : "border-line bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-ink">{pkg.name || "Untitled Package"}</span>
                  <span className="font-bold text-primary">£{pkg.price || 0}</span>
                </div>
                <p className="text-xs text-body-text">{pkg.description}</p>
              </div>
            ))}
          </div>

          {p.addons?.length > 0 && (
            <>
              <h4 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
                <FaPlus className="text-primary" /> Optional Add-ons
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {p.addons.map((addon) => (
                  <label
                    key={addon.id}
                    className={`flex items-center justify-between p-3 border rounded-2xl transition-all ${
                      isClient && !p.accepted ? "cursor-pointer hover:border-primary" : ""
                    } ${
                      selectedAddons.includes(addon.id)
                        ? "border-primary bg-primary-tint"
                        : "border-line bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-primary rounded"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => isClient && !p.accepted && toggleAddon(addon.id)}
                        disabled={!isClient || p.accepted}
                      />
                      <span className="text-sm font-medium text-ink">
                        {addon.name || "Untitled Add-on"}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary">£{addon.price || 0}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-body-text/70 font-medium">
          Submitted {timeAgo(p.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default ProposalCard;
