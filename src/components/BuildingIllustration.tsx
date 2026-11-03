/** The SwissInv building illustration (public/illustration.png), on a light card so it reads in both themes. */
export function BuildingIllustration({ width }: { width?: number }) {
  return <img className="illus" src={import.meta.env.BASE_URL + "illustration.png"} alt="" style={width ? { width, flex: "none" } : undefined} />;
}
