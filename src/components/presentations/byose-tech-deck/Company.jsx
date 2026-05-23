import { FlexBox, Heading, Image, Slide} from "spectacle";

function Company() {
    return (
        <Slide backgroundImage="linear-gradient(45deg, #DFF3E4 0%, #F0F6F6 100%)">
            <FlexBox height="100%" flexDirection="column"  justifyContent="center" padding="0 10%">
                <Heading fontSize="h1" color="#195C51" className="slide-zoom-in">
                    <FlexBox alignItems="center">
                        <Image src="../../assests/icons/Logo03.svg" alt="PresenceEye Logo" width={150} height={150} style={{ marginRight: '10px' }} />&nbsp;&nbsp;<span className={"mt-24"}>YOSE Tech</span>
                    </FlexBox>
                </Heading>
            </FlexBox>
        </Slide>
    );
}

export default Company;