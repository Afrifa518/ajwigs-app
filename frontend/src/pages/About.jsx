import React from "react";
import Title from "./../components/Title";
import { assets } from "./../assets/assets";

const About = () => {
  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={"ABOUT"} text2={"US"} />
      </div>

      <div className=" my-10 flex flex-col md:flex-row gap-16">
        <img
          className="w-full md:max-w-[450px]"
          src={assets.about_img}
          alt=""
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
          <p>
            El-ROI LUX HAIRS LTD was founded by Adwoa Afrifa in 2021 with a vision
            to bring high-quality, fashionable wigs to individuals seeking
            beauty, confidence, and self-expression. Based in the UK, our brand
            is built on the principles of craftsmanship, style, and
            authenticity.
          </p>
          <p>
            At El-ROI LUX HAIRS LTD, we believe that a wig is more than just a
            hairstyle—it's a way to express who you are. Our carefully curated
            collection offers something for every taste, ensuring that each
            customer feels unique and empowered. From our beginning, we have
            remained committed to providing premium wigs that combine comfort
            and versatility with cutting-edge style.
          </p>
          <b className="text-gray-800">Our Mission</b>
          <p>
            Our mission is to offer individuals the opportunity to express their
            personal style through high-quality wigs that blend fashion with
            function. We strive to build confidence in every customer by
            delivering products that are not only beautiful but also comfortable
            and versatile for everyday wear or special occasions.
          </p>
        </div>
      </div>

      <div className="text-xl py-4">
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
      </div>

      <div className="flex flex-col md:flex-row text-sm mb-20">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Quality Assurance</b>
          <p className="text-gray-600">At El-ROI LUX HAIRS LTD, quality is our top priority. Every wig is meticulously crafted using premium materials to ensure a natural look, durability, and ultimate comfort. We take pride in delivering products that meet the highest standards, so you can wear your wig with confidence.</p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Convenience</b>
          <p className="text-gray-600">We make shopping easy and stress-free. With our user-friendly online store, you can browse our wide selection of wigs, place your order, and have it delivered to your doorstep—no hassle, just beautiful wigs at your convenience.</p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Exceptional Customer Service</b>
          <p className="text-gray-600">Our team is dedicated to ensuring that every customer feels valued. Whether you need help choosing the right wig, have questions about care, or need support after your purchase, we’re here to assist you at every step of the way. Your satisfaction is our priority.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
