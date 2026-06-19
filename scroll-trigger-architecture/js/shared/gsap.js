import gsap from "https://esm.sh/gsap@3.13.0";
import { ScrollTrigger } from "https://esm.sh/gsap@3.13.0/ScrollTrigger";
import { SplitText } from "https://esm.sh/gsap@3.13.0/SplitText";
import { CustomEase } from "https://esm.sh/gsap@3.13.0/CustomEase";

gsap.registerPlugin(ScrollTrigger, CustomEase);

export default gsap;
export { gsap, ScrollTrigger, SplitText, CustomEase };
