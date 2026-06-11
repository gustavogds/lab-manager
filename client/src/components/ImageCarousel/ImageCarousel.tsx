import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "./ImageCarousel.scss";
import type { ContentImage } from "helpers/api/content";

interface ImageCarouselProps {
  images: ContentImage[];
  altPrefix?: string;
}

function Arrow(props: any) {
  const { className, onClick, direction } = props;

  return (
    <button
      type="button"
      className={`${className} carousel-arrow carousel-arrow--${direction}`}
      onClick={onClick}
      aria-label={direction === "next" ? "Next" : "Previous"}
    >
      <span aria-hidden="true">{direction === "next" ? "›" : "‹"}</span>
    </button>
  );
}

const ImageCarousel = ({ images, altPrefix = "Image" }: ImageCarouselProps) => {
  if (!images || images.length === 0) {
    return null;
  }

  const sliderSettings = {
    dots: false,
    infinite: images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: images.length > 1,
    autoplaySpeed: 5000,
    arrows: images.length > 1,
    adaptiveHeight: false,
    nextArrow: <Arrow direction="next" />,
    prevArrow: <Arrow direction="prev" />,
  };

  return (
    <div className="image-carousel">
      <Slider {...sliderSettings}>
        {images.map((image) => (
          <div key={image.id} className="carousel-slide">
            <img src={image.image} alt={`${altPrefix} ${image.order}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageCarousel;
