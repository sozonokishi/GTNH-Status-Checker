import React, { useState, useEffect} from 'react'
import {PlusMinus} from './components/PlusMinusSign.tsx';


interface SubItem {
  label: string;
  size: number;
}

interface CraftSub {
  active: SubItem[];
  pending: SubItem[];
}

interface Craft {
  id: number;
  label: string;
  size: number;
  stuck_count: number;
}

const mainStyle: 
React.CSSProperties = {
  backgroundColor: "#121212",
  color: "#fff",
  minHeight: "100vh",
  padding: "20px"
}

const bannerStyle:
React.CSSProperties = {
  background: "#b66b49",
  width: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  paddingTop: "5px",
  paddingBottom: "5px"
}

const titleStyle:
React.CSSProperties = {
    margin: "20px",
    fontSize: "2.25rem",
    fontWeight: "800",
    letterSpacing: "3px",
    color: "#ffffff",
    textTransform: "uppercase",
    lineHeight: "1.2"
}

const ColumnStyle:
React.CSSProperties ={
  display: "grid",
  gridTemplateColumns: "40px minmax(60%, 1fr) 120px",
  textAlign: "left",
}

const mainContainerStyle:
React.CSSProperties ={
  ...ColumnStyle,
  borderBottom: "1px solid #dbdbdb",
  marginTop: "",
  gridColumn: "span 3",
}

const headerContainerStyle:
React.CSSProperties ={
  ...ColumnStyle,
  justifyContent: "center",
  alignItems: "center",
  marginTop: "2rem",

  borderTop: "#919191 solid 1px",
  borderBottom: "#919191 solid 1px"
}

const headerStyle:
React.CSSProperties ={
  font: "Segoe UI",
  fontWeight: '400',
  fontSize: "1.5rem",
  textAlign: "left",
  textTransform: "uppercase",
  marginTop: "1.5rem",
}

const subContainerHeaderStyle:
React.CSSProperties = {
  font: "Segoe UI",
  fontSize: "23px",
  fontWeight: "400",
  borderBottom: "#fff solid 1px",
  paddingBottom: "8px",
  marginTop: "1rem"
}

const subContainerBodyStyle:
React.CSSProperties = {
  paddingBottom: "8px",
}


export default function App(){
  const [crafts, setCraft] = useState<Craft[]>([]);
  const [expandedCraftId, setExpandedCraftId] = useState<number|null>(null);
  const [expandedCraftDetails, setExpandedCraftDetails] = useState<Record<number,CraftSub[]>>({});

  //function to fetch crafts
  const fetchCrafts = async () => {
    try {
      const endpoint = "https://gtnh-status-checker.onrender.com/get-crafts?latest=true";
      const response = await fetch(endpoint);
      const jsonResponse = await response.json();
      const processed_data: Craft[] = jsonResponse.data.map((item:any) => ({
            id: item.craft_id,
            label: item.output_label,
            size: item.remaining_size,
            stuck_count: item.stuck_count
        }
      ));
      setCraft(processed_data);
  }
  catch (err) {
      console.log("Error fetching for latest data")
    }
  }


  //For calculating RGB based on how stuck the craft is
  const calculateColor = (value: number, maxValue: number, opacity: number=1) => {
    //thanks ai
    const colorPalette = [
        { r: 0,   g: 230, b: 118 }, //(Safe - #00E676)
        { r: 255, g: 234, b: 0   }, //(Caution - #FFEA00)
        { r: 255, g: 145, b: 0   }, //(Warning - #FF9100)
        { r: 255, g: 82,  b: 82  }  //(Danger - #FF5252)
    ]

    //return danger if it's past the max value
    if (value >= maxValue) {return `rbg(${colorPalette[-1].r},${colorPalette[-1].g},${colorPalette[-1].b})`}

    const segmentCount:number = colorPalette.length

    const valueScaledToSegment:number = segmentCount - segmentCount*(maxValue-value)/maxValue; //To get the value scaled to segment's value, (50 in range [0,100] would yield 2 for scaled value)
    const segmentCeiling:number = Math.ceil(valueScaledToSegment); //To get the ceiling of the scaled value (i.e. 3.33 -> 4)
    const segmentFloor:number = Math.max(0,segmentCeiling - 1); //to consider the situation where segmentceiling is 0.

    const factor = valueScaledToSegment - segmentFloor;

    const red = colorPalette[segmentFloor].r + (colorPalette[segmentCeiling].r - colorPalette[segmentFloor].r)*factor;
    const green = colorPalette[segmentFloor].g + (colorPalette[segmentCeiling].g - colorPalette[segmentFloor].g)*factor;
    const blue = colorPalette[segmentFloor].b + (colorPalette[segmentCeiling].b - colorPalette[segmentFloor].b)*factor;

    return `rgb(${red},${green},${blue},${opacity})`
  }


  //For toggling expand craft
  const toggleExpandCraft = async (id: number) => {
    if (expandedCraftId === id) {
      setExpandedCraftId(null); //Collapse if it's already expanded.
      return;
    }

    setExpandedCraftId(id);


    if (expandedCraftDetails[id] !== undefined) { //if there is actually already value for this id, return.
      return;
    }
    else {
      try {
        const endpoint = `https://gtnh-status-checker.onrender.com/api/crafts/${id}`;
        const response = await fetch(endpoint);
        const data:CraftSub = await response.json();

        setExpandedCraftDetails((expandedCraftDetails) => ({
          ...expandedCraftDetails,
          [id]: [{
            active: data.active,
            pending: data.pending
          }],
        }));
        return;
      }
      catch (error) {
        console.log(`Something went wrong when fetching for craft ${id}`)
      }
    }
  }

  //Start checking for crafts since startup load.

  useEffect(() => {fetchCrafts()}, [])

  useEffect(() => {
    //Timer based fetching
    const fetchCraftsInterval = setInterval(fetchCrafts,60000);

    //Event based fetching (need this in case of inactivity from user by unfocusing the tab)
    const handleVisibilityBack = () => {
      if (document.visibilityState === "visible"){
        fetchCrafts();
      }
    }

    addEventListener("visiblitychange", handleVisibilityBack)
    return () => {
      clearInterval(fetchCraftsInterval);
      removeEventListener("visiblitychange", handleVisibilityBack);
    }
  },[]);


  return (
    <div style={mainStyle}>
      <div style={bannerStyle}>
        <h1 style={titleStyle}>GTNH Craft Dashboard</h1>
      </div>
      

      <div style={headerContainerStyle}>
        <h2 style={{...headerStyle, gridColumn:"1/2"}}>Label</h2>
        <h2 style={{...headerStyle, gridColumn:"3/4", textAlign:"right"}}>Size</h2>
      </div>

      {crafts?.map((craft) => {
        const isExpanded:boolean = expandedCraftId === craft.id;
        const color = calculateColor(craft.stuck_count, 100, 1);
        

        return(
          <div style={{...mainContainerStyle, boxShadow:`inset 7px 0 0 0 ${color}`}} key={craft.id}>
            <div style={{display:"contents"}} onClick={() => {toggleExpandCraft(craft.id)}}>
              <PlusMinus size="15" plusColor={color} minusColor={color} isPlus={!isExpanded}></PlusMinus>
              <h4>{craft.label}</h4>
              <h4 style={{textAlign:"right"}}>{craft.size}</h4>
            </div>

            {/*Check if user toggled to expand the row */}
            {isExpanded ? (
              <div style={{display:"contents"}}>
                {!expandedCraftDetails[craft.id] ? (
                  <p style={{gridColumn: "2/3"}}>Loading...</p>
                ) : (
                <React.Fragment>
                  {
                    expandedCraftDetails[craft.id]?.map((craftsub) => {
                      const pending_items = craftsub.pending;
                      const active_items = craftsub.active;

                      return(
                        <React.Fragment>
                          {pending_items.length > 0 ? (
                            <React.Fragment>
                              <span style={{...subContainerHeaderStyle, gridColumn: "2/3"}}>Pending Item</span>
                              {
                                pending_items.map((subitem) => {
                                  return(
                                    <div style={{display:"contents"}}>
                                      <span style={{...subContainerBodyStyle, gridColumn:"2/3"}}>{subitem.label}</span>
                                      <span style={{...subContainerBodyStyle, gridColumn:"3/4", textAlign:"end"}}>{subitem.size}</span>
                                    </div>
                                  )
                                })
                              }
                            </React.Fragment>
                            ): null
                          }
                          {active_items.length > 0 ? (
                            <React.Fragment>
                              <span style={{...subContainerHeaderStyle, gridColumn: "2/3"}}>Active Item</span>
                                {
                                  active_items.map((subitem) => {
                                    return(
                                      <div style={{display:"contents"}}>
                                        <span style={{...subContainerBodyStyle, gridColumn:"2/3"}}>{subitem.label}</span>
                                        <span style={{...subContainerBodyStyle, gridColumn:"3/4", textAlign:"end"}}>{subitem.size}</span>
                                      </div>
                                    )
                                  })
                                }
                            </React.Fragment>
                            ): null
                          }
                        </React.Fragment>
                      )
                    })
                  }
                </React.Fragment>
                )}

              </div>
            ): null
            }
          </div>
        )
      })}
      </div>

  )
}