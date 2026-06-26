import Logo from "@/app/storefront/components/Logo";

export default function StorefrontFooter() {
  return (
    <div>
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        <div>
          <Logo markClassName="h-12 w-12" className="mb-5 text-[#1c1714]" />
          <p className="w-full md:w-2/3 text-gray-600">
            At El-ROI LUX HAIRS LTD, we believe in empowering everyone to feel confident and
            beautiful. Our high-quality wigs offer a perfect blend of comfort and style,
            allowing you to express your unique personality with ease. Let us help you find
            the look that makes you shine.
          </p>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">EL-ROI LUX HAIRS LTD</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+44 7960 609298</li>
            <li>houseofajwigs@gmail.com</li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright © {new Date().getFullYear()} El-ROI LUX HAIRS LTD - All rights reserved.
        </p>
      </div>
    </div>
  );
}
