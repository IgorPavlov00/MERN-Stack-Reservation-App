import "./propertyList.css";

const PropertyList = () => {
  const properties = [
    {
      img: "https://cf.bstatic.com/xdata/images/xphoto/square300/57584488.webp?k=bf724e4e9b9b75480bbe7fc675460a089ba6414fe4693b83ea3fdd8e938832a6&o=",
      title: "Hotels",
      count: 233,
    },
    {
      img: "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-apartments_300/9f60235dc09a3ac3f0a93adbc901c61ecd1ce72e.jpg",
      title: "Apartments",
      count: 2331,
    },
    {
      img: "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/bg_resorts/6f87c6143fbd51a0bb5d15ca3b9cf84211ab0884.jpg",
      title: "Resorts",
      count: 2331,
    },
    {
      img: "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-villas_300/dd0d7f8202676306a661aa4f0cf1ffab31286211.jpg",
      title: "Villas",
      count: 2331,
    },
    {
      img: "https://cf.bstatic.com/static/img/theme-index/carousel_320x240/card-image-chalet_300/8ee014fcc493cb3334e25893a1dee8c6d36ed0ba.jpg",
      title: "Cabins",
      count: 2331,
    },
  ];

  return (
    <div className="pList">
      {properties.map((property) => (
        <div className="pListItem" key={property.title}>
          {" "}
          {/* Added key prop */}
          <img src={property.img} alt={property.title} className="pListImg" />
          <div className="pListTitles">
            <h1>{property.title}</h1>
            <h2>
              {property.count}{" "}
              {property.count === 1 ? "property" : "properties"}
            </h2>{" "}
            {/* Conditional pluralization */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertyList;
