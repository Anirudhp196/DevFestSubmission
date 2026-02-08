import svgPaths from "./svg-y53m400yen";

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#32b377] text-[14px] text-center tracking-[1.4px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">Features</p>
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[36px] text-center whitespace-nowrap">
        <p className="leading-[40px]">Ticketing, reimagined</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[576px] pt-[4px] relative shrink-0 w-[576px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[24px] not-italic relative shrink-0 text-[#87928e] text-[16px] text-center whitespace-nowrap">
        <p className="mb-0">Built from the ground up to solve the problems that plague traditional</p>
        <p>ticketing. Transparent, fair, and fan-first.</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-center relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <Heading1 />
      <Container3 />
    </div>
  );
}

function Svg() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p373a5680} id="Vector" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10.8333 4.16667V5.83333" id="Vector_2" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10.8333 14.1667V15.8333" id="Vector_3" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d="M10.8333 9.16667V10.8333" id="Vector_4" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Overlay() {
  return (
    <div className="absolute bg-[rgba(50,179,119,0.1)] content-stretch flex items-center justify-center left-[24px] rounded-[12px] size-[40px] top-[24px]" data-name="Overlay">
      <Svg />
    </div>
  );
}

function Heading2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[80px]" data-name="Heading 3">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">NFT Tickets</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[115.25px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.75px] not-italic relative shrink-0 text-[#87928e] text-[14px] whitespace-nowrap">
        <p className="mb-0">Every ticket is minted as an NFT on Solana,</p>
        <p className="mb-0">verifiable on-chain and stored in your wallet. No</p>
        <p>fakes, no duplicates.</p>
      </div>
    </div>
  );
}

function BackgroundBorder() {
  return (
    <div className="absolute bg-[#090b0b] border border-[#262b2a] border-solid h-[210.25px] left-0 right-[784px] rounded-[12px] top-0" data-name="Background+Border">
      <Overlay />
      <Heading2 />
      <Container5 />
    </div>
  );
}

function Svg1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.pa6d0980} id="Vector" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Overlay1() {
  return (
    <div className="absolute bg-[rgba(50,179,119,0.1)] content-stretch flex items-center justify-center left-[24px] rounded-[12px] size-[40px] top-[24px]" data-name="Overlay">
      <Svg1 />
    </div>
  );
}

function Heading3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[80px]" data-name="Heading 3">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">Loyalty Badges</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[115.25px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.75px] not-italic relative shrink-0 text-[#87928e] text-[14px] whitespace-nowrap">
        <p className="mb-0">Earn loyalty badges by attending events.</p>
        <p className="mb-0">Bronze, Silver, and Gold tiers unlock early</p>
        <p>access to future ticket drops.</p>
      </div>
    </div>
  );
}

function BackgroundBorder1() {
  return (
    <div className="absolute bg-[#090b0b] border border-[#262b2a] border-solid h-[210.25px] left-[392px] right-[392px] rounded-[12px] top-0" data-name="Background+Border">
      <Overlay1 />
      <Heading3 />
      <Container6 />
    </div>
  );
}

function Svg2() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p2e8a9780} id="Vector" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p12353b00} id="Vector_2" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p35156180} id="Vector_3" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Overlay2() {
  return (
    <div className="absolute bg-[rgba(50,179,119,0.1)] content-stretch flex items-center justify-center left-[24px] rounded-[12px] size-[40px] top-[24px]" data-name="Overlay">
      <Svg2 />
    </div>
  );
}

function Heading4() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[80px]" data-name="Heading 3">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[17.9px] whitespace-nowrap">
        <p className="leading-[28px]">Fair Marketplace</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[115.25px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.75px] not-italic relative shrink-0 text-[#87928e] text-[14px] whitespace-nowrap">
        <p className="mb-0">Resale profits are split 40% organizer, 40% seller,</p>
        <p className="mb-0">20% platform. Scalping incentives are</p>
        <p>structurally eliminated.</p>
      </div>
    </div>
  );
}

function BackgroundBorder2() {
  return (
    <div className="absolute bg-[#090b0b] border border-[#262b2a] border-solid h-[210.25px] left-[784px] right-0 rounded-[12px] top-0" data-name="Background+Border">
      <Overlay2 />
      <Heading4 />
      <Container7 />
    </div>
  );
}

function Svg3() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p25fc4100} id="Vector" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Overlay3() {
  return (
    <div className="absolute bg-[rgba(50,179,119,0.1)] content-stretch flex items-center justify-center left-[24px] rounded-[12px] size-[40px] top-[24px]" data-name="Overlay">
      <Svg3 />
    </div>
  );
}

function Heading5() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[80px]" data-name="Heading 3">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">Anti-Scalping</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[115.25px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.75px] not-italic relative shrink-0 text-[#87928e] text-[14px] whitespace-nowrap">
        <p className="mb-0">On-chain cooldowns, per-address caps, and</p>
        <p className="mb-0">loyalty gating ensure tickets reach real fans, not</p>
        <p>bots.</p>
      </div>
    </div>
  );
}

function BackgroundBorder3() {
  return (
    <div className="absolute bg-[#090b0b] border border-[#262b2a] border-solid h-[210.25px] left-0 right-[784px] rounded-[12px] top-[234.25px]" data-name="Background+Border">
      <Overlay3 />
      <Heading5 />
      <Container8 />
    </div>
  );
}

function Svg4() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p3a2fa580} id="Vector" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Overlay4() {
  return (
    <div className="absolute bg-[rgba(50,179,119,0.1)] content-stretch flex items-center justify-center left-[24px] rounded-[12px] size-[40px] top-[24px]" data-name="Overlay">
      <Svg4 />
    </div>
  );
}

function Heading6() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[80px]" data-name="Heading 3">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">Instant Settlement</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[115.25px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.75px] not-italic relative shrink-0 text-[#87928e] text-[14px] whitespace-nowrap">
        <p className="mb-0">{`Solana's sub-second finality means purchases,`}</p>
        <p className="mb-0">transfers, and resales settle immediately. No</p>
        <p>stuck transactions.</p>
      </div>
    </div>
  );
}

function BackgroundBorder4() {
  return (
    <div className="absolute bg-[#090b0b] border border-[#262b2a] border-solid h-[210.25px] left-[392px] right-[392px] rounded-[12px] top-[234.25px]" data-name="Background+Border">
      <Overlay4 />
      <Heading6 />
      <Container9 />
    </div>
  );
}

function Svg5() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="SVG">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="SVG">
          <path d={svgPaths.p25397b80} id="Vector" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p166b7100} id="Vector_2" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2241fff0} id="Vector_3" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2c4f400} id="Vector_4" stroke="var(--stroke-0, #32B377)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Overlay5() {
  return (
    <div className="absolute bg-[rgba(50,179,119,0.1)] content-stretch flex items-center justify-center left-[24px] rounded-[12px] size-[40px] top-[24px]" data-name="Overlay">
      <Svg5 />
    </div>
  );
}

function Heading7() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[80px]" data-name="Heading 3">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">Role-Based Access</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] right-[24px] top-[115.25px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.75px] not-italic relative shrink-0 text-[#87928e] text-[14px] whitespace-nowrap">
        <p className="mb-0">Organizers manage events and track sales. Fans</p>
        <p className="mb-0">browse, buy, earn loyalty, and resell. Each role</p>
        <p>gets a tailored experience.</p>
      </div>
    </div>
  );
}

function BackgroundBorder5() {
  return (
    <div className="absolute bg-[#090b0b] border border-[#262b2a] border-solid h-[210.25px] left-[784px] right-0 rounded-[12px] top-[234.25px]" data-name="Background+Border">
      <Overlay5 />
      <Heading7 />
      <Container10 />
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[444.5px] relative shrink-0 w-full" data-name="Container">
      <BackgroundBorder />
      <BackgroundBorder1 />
      <BackgroundBorder2 />
      <BackgroundBorder3 />
      <BackgroundBorder4 />
      <BackgroundBorder5 />
    </div>
  );
}

function Container() {
  return (
    <div className="max-w-[1152px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[64px] items-start max-w-[inherit] relative w-full">
        <Container1 />
        <Container4 />
      </div>
    </div>
  );
}

function Section() {
  return (
    <div className="absolute bg-[#131615] content-stretch flex flex-col items-start left-0 pb-[96px] pt-[97px] px-[180px] right-0 top-[620.5px]" data-name="Section">
      <div aria-hidden="true" className="absolute border-[#262b2a] border-solid border-t inset-0 pointer-events-none" />
      <Container />
    </div>
  );
}

function Container12() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-center relative">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#32b377] text-[14px] text-center whitespace-nowrap">
          <p className="leading-[20px]">Built on Solana</p>
        </div>
      </div>
    </div>
  );
}

function OverlayBorder() {
  return (
    <div className="bg-[rgba(50,179,119,0.05)] content-stretch flex gap-[8px] items-center px-[17px] py-[7px] relative rounded-[9999px] shrink-0" data-name="Overlay+Border">
      <div aria-hidden="true" className="absolute border border-[rgba(50,179,119,0.2)] border-solid inset-0 pointer-events-none rounded-[9999px]" />
      <div className="bg-[#32b377] rounded-[9999px] shrink-0 size-[8px]" data-name="Background" />
      <Container12 />
    </div>
  );
}

function Margin() {
  return (
    <div className="content-stretch flex flex-col items-start pb-[24px] relative shrink-0" data-name="Margin">
      <OverlayBorder />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0" data-name="Heading 1">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[72px] relative shrink-0 text-[#fafaf9] text-[0px] text-[72px] text-center tracking-[-1.8px] whitespace-nowrap">
        <p className="mb-0">Fair Tickets.</p>
        <p className="text-[#32b377]">Real Fans.</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[672px] px-[0.66px] relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[28px] not-italic relative shrink-0 text-[#87928e] text-[20px] text-center whitespace-nowrap">
        <p className="mb-0">Matcha is a decentralized concert ticketing platform where every ticket</p>
        <p>is an NFT, loyalty is rewarded, and scalpers are left behind.</p>
      </div>
    </div>
  );
}

function Margin1() {
  return (
    <div className="content-stretch flex flex-col items-start max-w-[672px] pt-[24px] relative shrink-0" data-name="Margin">
      <Container13 />
    </div>
  );
}

function Frame() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[16px]" data-name="Frame">
      <div className="absolute inset-[12.5%_8.33%_33.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-7.69%_-5.26%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 10">
            <path d={svgPaths.p323831} id="Vector" stroke="var(--stroke-0, #090B0B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[20.83%_12.5%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-6.25%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 12">
            <path d={svgPaths.pc65f180} id="Vector" stroke="var(--stroke-0, #090B0B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg6() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[16px]" data-name="SVG">
      <Frame />
    </div>
  );
}

function SvgMargin() {
  return (
    <div className="content-stretch flex flex-col h-[16px] items-start pr-[8px] relative shrink-0 w-[24px]" data-name="SVG:margin">
      <Svg6 />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-[#32b377] content-stretch flex gap-[8px] h-[44px] items-center justify-center px-[32px] relative rounded-[10px] shrink-0" data-name="Button">
      <SvgMargin />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#090b0b] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Connect Wallet</p>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="content-stretch flex h-[44px] items-center justify-center px-[33px] py-px relative rounded-[10px] shrink-0" data-name="Link">
      <div aria-hidden="true" className="absolute border border-[#262b2a] border-solid inset-0 pointer-events-none rounded-[10px]" />
      <a className="cursor-pointer flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#fafaf9] text-[14px] text-center whitespace-nowrap" href="https://vm-s89du262o5hqcvo7zqwudn.vusercontent.net/#features">
        <p className="leading-[20px]">Learn More</p>
      </a>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0" data-name="Container">
      <Button />
      <Link />
    </div>
  );
}

function Margin2() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[40px] relative shrink-0" data-name="Margin">
      <Container14 />
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[30px] text-center whitespace-nowrap">
        <p className="leading-[36px]">10K+</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#87928e] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Tickets Minted</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start min-w-[137.58999633789062px] relative self-stretch shrink-0" data-name="Container">
      <Container17 />
      <Container18 />
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[30px] text-center whitespace-nowrap">
        <p className="leading-[36px]">Custom</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#87928e] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Organizer-Set Resale Split</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative self-stretch shrink-0" data-name="Container">
      <Container20 />
      <Container21 />
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[30px] text-center whitespace-nowrap">
        <p className="leading-[36px]">{`< 0.001`}</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#87928e] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">SOL per Transaction</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative self-stretch shrink-0" data-name="Container">
      <Container23 />
      <Container24 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex gap-[64px] items-start relative shrink-0" data-name="Container">
      <Container16 />
      <Container19 />
      <Container22 />
    </div>
  );
}

function Margin3() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[64px] relative shrink-0" data-name="Margin">
      <Container15 />
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-center max-w-[896px] relative shrink-0" data-name="Container">
      <Margin />
      <Heading />
      <Margin1 />
      <Margin2 />
      <Margin3 />
    </div>
  );
}

function Section1() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-0 min-h-[620.5px] overflow-clip px-[16px] py-[65.25px] right-0 top-0" data-name="Section">
      <div className="absolute inset-0" data-name="Gradient" style={{ backgroundImage: "linear-gradient(rgba(50, 179, 119, 0.03) 1.5625%, rgba(50, 179, 119, 0) 1.5625%), linear-gradient(90deg, rgba(50, 179, 119, 0.03) 1.5625%, rgba(50, 179, 119, 0) 1.5625%)" }} />
      <div className="absolute inset-0" data-name="Gradient" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg viewBox=\'0 0 1512 620.5\' xmlns=\'http://www.w3.org/2000/svg\' preserveAspectRatio=\'none\'><rect x=\'0\' y=\'0\' height=\'100%\' width=\'100%\' fill=\'url(%23grad)\' opacity=\'1\'/><defs><radialGradient id=\'grad\' gradientUnits=\'userSpaceOnUse\' cx=\'0\' cy=\'0\' r=\'10\' gradientTransform=\'matrix(106.91 0 0 43.876 756 310.25)\'><stop stop-color=\'rgba(50,179,119,0.08)\' offset=\'0\'/><stop stop-color=\'rgba(50,179,119,0)\' offset=\'0.7\'/></radialGradient></defs></svg>')" }} />
      <Container11 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#32b377] text-[14px] text-center tracking-[1.4px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">How It Works</p>
      </div>
    </div>
  );
}

function Heading8() {
  return (
    <div className="content-stretch flex flex-col items-center relative shrink-0 w-full" data-name="Heading 2">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[36px] text-center whitespace-nowrap">
        <p className="leading-[40px]">From wallet to front row</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full" data-name="Container">
      <Container27 />
      <Heading8 />
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[36px] text-[rgba(50,179,119,0.2)] whitespace-nowrap">
        <p className="leading-[40px]">01</p>
      </div>
    </div>
  );
}

function Heading9() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[52px]" data-name="Heading 3">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[17.9px] whitespace-nowrap">
        <p className="leading-[28px]">Connect Your Wallet</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[87.25px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.75px] not-italic relative shrink-0 text-[#87928e] text-[14px] whitespace-nowrap">
        <p className="mb-0">Link your Solana wallet (Phantom,</p>
        <p className="mb-0">Solflare, or any compatible wallet)</p>
        <p>to get started.</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container30 />
      <Heading9 />
      <Container31 />
      <div className="absolute bg-[#262b2a] h-px right-[-16px] top-[32px] w-[32px]" data-name="Horizontal Divider" />
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[36px] text-[rgba(50,179,119,0.2)] whitespace-nowrap">
        <p className="leading-[40px]">02</p>
      </div>
    </div>
  );
}

function Heading10() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[52px]" data-name="Heading 3">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">Choose Your Role</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[87.25px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.75px] not-italic relative shrink-0 text-[#87928e] text-[14px] whitespace-nowrap">
        <p className="mb-0">Select Organizer to create events and</p>
        <p className="mb-0">sell tickets, or Fan to browse and</p>
        <p>buy.</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container33 />
      <Heading10 />
      <Container34 />
      <div className="absolute bg-[#262b2a] h-px right-[-16px] top-[32px] w-[32px]" data-name="Horizontal Divider" />
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[36px] text-[rgba(50,179,119,0.2)] whitespace-nowrap">
        <p className="leading-[40px]">03</p>
      </div>
    </div>
  );
}

function Heading11() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[52px]" data-name="Heading 3">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">Buy or Create Events</p>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[87.25px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.75px] not-italic relative shrink-0 text-[#87928e] text-[14px] whitespace-nowrap">
        <p className="mb-0">Organizers set up events with ticket</p>
        <p className="mb-0">supply and pricing. Fans purchase</p>
        <p>NFT tickets instantly.</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container36 />
      <Heading11 />
      <Container37 />
      <div className="absolute bg-[#262b2a] h-px right-[-16px] top-[32px] w-[32px]" data-name="Horizontal Divider" />
    </div>
  );
}

function Container39() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-0" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[36px] text-[rgba(50,179,119,0.2)] whitespace-nowrap">
        <p className="leading-[40px]">04</p>
      </div>
    </div>
  );
}

function Heading12() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[52px]" data-name="Heading 3">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">{`Earn & Unlock`}</p>
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 right-0 top-[87.25px]" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[22.75px] not-italic relative shrink-0 text-[#87928e] text-[14px] whitespace-nowrap">
        <p className="mb-0">Attend events to earn loyalty</p>
        <p className="mb-0">badges. Higher tiers unlock early</p>
        <p>access to future drops.</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative self-stretch" data-name="Container">
      <Container39 />
      <Heading12 />
      <Container40 />
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex gap-[32px] items-start justify-center relative shrink-0 w-full" data-name="Container">
      <Container29 />
      <Container32 />
      <Container35 />
      <Container38 />
    </div>
  );
}

function Container25() {
  return (
    <div className="max-w-[1024px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[64px] items-start max-w-[inherit] relative w-full">
        <Container26 />
        <Container28 />
      </div>
    </div>
  );
}

function Section2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 pb-[96px] pt-[97px] px-[244px] right-0 top-[1458px]" data-name="Section">
      <div aria-hidden="true" className="absolute border-[#262b2a] border-solid border-t inset-0 pointer-events-none" />
      <Container25 />
    </div>
  );
}

function Main() {
  return (
    <div className="absolute h-[1943.25px] left-0 right-0 top-[65px]" data-name="Main">
      <Section />
      <Section1 />
      <Section2 />
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#090b0b] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">M</p>
      </div>
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#32b377] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[28px]" data-name="Background">
      <Container43 />
    </div>
  );
}

function Container44() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[18px] whitespace-nowrap">
        <p className="leading-[28px]">Matcha</p>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Container">
      <Background />
      <Container44 />
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#87928e] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">Fair concert ticketing on Solana. Built by fans, for fans.</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#87928e] text-[0px] whitespace-nowrap" href="https://vm-s89du262o5hqcvo7zqwudn.vusercontent.net/">
        <p className="cursor-pointer leading-[20px] text-[14px]">Docs</p>
      </a>
    </div>
  );
}

function Link2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#87928e] text-[0px] whitespace-nowrap" href="https://vm-s89du262o5hqcvo7zqwudn.vusercontent.net/">
        <p className="cursor-pointer leading-[20px] text-[14px]">GitHub</p>
      </a>
    </div>
  );
}

function Link3() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Link">
      <a className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#87928e] text-[0px] whitespace-nowrap" href="https://vm-s89du262o5hqcvo7zqwudn.vusercontent.net/">
        <p className="cursor-pointer leading-[20px] text-[14px]">Twitter</p>
      </a>
    </div>
  );
}

function Container46() {
  return (
    <div className="content-stretch flex gap-[24px] items-center relative shrink-0" data-name="Container">
      <Link1 />
      <Link2 />
      <Link3 />
    </div>
  );
}

function Container41() {
  return (
    <div className="max-w-[1152px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between max-w-[inherit] pr-[0.01px] relative w-full">
          <Container42 />
          <Container45 />
          <Container46 />
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute bg-[#131615] content-stretch flex flex-col items-start left-0 pb-[48px] pt-[49px] px-[180px] right-0 top-[2008.25px]" data-name="Footer">
      <div aria-hidden="true" className="absolute border-[#262b2a] border-solid border-t inset-0 pointer-events-none" />
      <Container41 />
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#090b0b] text-[0px] text-left whitespace-nowrap" role="link" tabIndex={0}>
        <p className="cursor-pointer leading-[20px] text-[14px]">M</p>
      </div>
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#32b377] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[32px]" data-name="Background">
      <Container47 />
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Space_Grotesk:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[#fafaf9] text-[0px] text-left whitespace-nowrap" role="link" tabIndex={0}>
        <p className="cursor-pointer leading-[28px] text-[20px]">Matcha</p>
      </div>
    </div>
  );
}

function Link4() {
  return (
    <a className="content-stretch cursor-pointer flex gap-[8px] items-center relative shrink-0" data-name="Link" href="https://vm-s89du262o5hqcvo7zqwudn.vusercontent.net/">
      <Background1 />
      <Container48 />
    </a>
  );
}

function Frame1() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-[16px]" data-name="Frame">
      <div className="absolute inset-[12.5%_8.33%_33.33%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-7.69%_-5.26%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 10">
            <path d={svgPaths.p323831} id="Vector" stroke="var(--stroke-0, #090B0B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[20.83%_12.5%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-6.25%_-5.56%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 12">
            <path d={svgPaths.pc65f180} id="Vector" stroke="var(--stroke-0, #090B0B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Svg7() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[16px]" data-name="SVG">
      <Frame1 />
    </div>
  );
}

function SvgMargin1() {
  return (
    <div className="content-stretch flex flex-col h-[16px] items-start pr-[8px] relative shrink-0 w-[24px]" data-name="SVG:margin">
      <Svg7 />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-[#32b377] content-stretch flex gap-[8px] h-[40px] items-center justify-center px-[16px] py-[8px] relative rounded-[10px] shrink-0" data-name="Button">
      <SvgMargin1 />
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#090b0b] text-[14px] text-center whitespace-nowrap">
        <p className="leading-[20px]">Connect Wallet</p>
      </div>
    </div>
  );
}

function Nav() {
  return (
    <div className="max-w-[1280px] relative shrink-0 w-full" data-name="Nav">
      <div className="flex flex-row items-center max-w-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between max-w-[inherit] px-[16px] py-[12px] relative w-full">
          <Link4 />
          <Button1 />
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="backdrop-blur-[6px] bg-[rgba(9,11,11,0.8)] content-stretch flex flex-col items-start pb-px pointer-events-auto px-[116px] sticky top-0" data-name="Header">
      <div aria-hidden="true" className="absolute border-[#262b2a] border-b border-solid inset-0 pointer-events-none" />
      <Nav />
    </div>
  );
}

export default function Component1512WDefault() {
  return (
    <div className="relative size-full" data-name="1512w default" style={{ backgroundImage: "linear-gradient(90deg, rgb(9, 11, 11) 0%, rgb(9, 11, 11) 100%), linear-gradient(90deg, rgb(9, 11, 11) 0%, rgb(9, 11, 11) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Main />
      <Footer />
      <div className="absolute h-[2133.25px] inset-0 pointer-events-none">
        <Header />
      </div>
    </div>
  );
}