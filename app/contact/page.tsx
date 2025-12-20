import Image from "next/image";
import { assets } from "@/app/storefront/assets";
import Title from "@/app/storefront/components/Title";

export default function ContactPage() {
  return (
    <div>
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1="CONTACT" text2="US" />
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
        <Image className="w-full md:max-w-[480px]" src={assets.contact_img} alt="" />
        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-semibold text-xl text-gray-600">Our Store</p>
          <p className="text-gray-500">
            60 Abbotts Road, 60, <br />Mitcham, CR4 1JU, United Kingdom
          </p>
          <p className="text-gray-500">
            Tel: +44 7960 609298 <br />Email: houseofajwigs@gmail.com
          </p>
          <p></p>
          <p></p>
        </div>
      </div>
    </div>
  );
}
