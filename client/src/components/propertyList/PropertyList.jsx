import { useNavigate } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { FadeImg } from "../motion/Motion";
import "./propertyList.css";

const IMAGES = {
  hotel: "https://cf.bstatic.com/xdata/images/xphoto/square300/57584488.webp?k=bf724e4e9b9b75480bbe7fc675460a089ba6414fe4693b83ea3fdd8e938832a6&o=",
  apartment: "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-apartments_300/9f60235dc09a3ac3f0a93adbc901c61ecd1ce72e.jpg",
  resort: "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/bg_resorts/6f87c6143fbd51a0bb5d15ca3b9cf84211ab0884.jpg",
  villa: "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-villas_300/dd0d7f8202676306a661aa4f0cf1ffab31286211.jpg",
  cabin: "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-chalet_300/8ee014fcc493cb3334e25893a1dee8c6d36ed0ba.jpg",
};

const PropertyList = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch("/hotels/countByType");

  if (error) return <p className="muted">Could not load property types.</p>;

  return (
    <div className="pList">
      {loading
        ? Object.keys(IMAGES).map((k) => <div key={k} className="pListItem skeleton" />)
        : data.map((p, i) => (
            <button
              type="button"
              className="pListItem stagger"
              style={{ "--i": i }}
              key={p.type}
              onClick={() => navigate(`/hotels?type=${p.type}`)}
            >
              <FadeImg src={IMAGES[p.type]} alt="" className="pListImg" loading="lazy" />
              <div className="pListTitles">
                <h3>{p.label[0].toUpperCase() + p.label.slice(1)}</h3>
                <span>
                  {p.count} {p.count === 1 ? "property" : "properties"}
                </span>
              </div>
            </button>
          ))}
    </div>
  );
};

export default PropertyList;
