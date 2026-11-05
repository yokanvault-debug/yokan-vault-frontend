export default String.raw`
setcps(100/60/4)  // ♩ = 100, 4/4, one bar per cycle

// ---------- Melody (Piano 1, right hand) ----------
const A1 = "e4 f#4 a4 b4 e5 d5 c#5 b4"
const A2 = "d4 e4 f#4 a4 b4 a4 f#4 e4"
const A3 = "c#4 e4 f#4 a4 b4 a4 f#4 e4"
const B1 = "e5 g5 d5 e5 f5 e5 d5 c5"
const B2 = "ab4 bb4 c5 d5 c5 a5 g5@2"
const B3 = "e5 g5 e5 d5 c5 b4 a4 g4"
const B4 = "ab4 bb4 c5 d5 e5@2 g5@2"

const A = [A1,A1,A2,A3,A1,A1,A2,A3]
const B = [B1,B2,B1,B2,B3,B4,B3,B4]
const melody = cat(...A, ...B, ...A, ...B)

// ---------- Piano 1 left hand ----------
const LF = "f#3@4 c#3@3 a2@9"   // F#m bass figure
const LD = "a3@4 f#3@3 d3@9"    // D bass figure
const LA = [LF,LF,LD,LD,LF,LF,LD,LD]
const LB = ["[a2,e3,c4]","[ab2,eb3,c4]"]  // approximate chords
const lh1 = cat(...LA, ...Array(4).fill(LB).flat(), ...LA, ...Array(4).fill(LB).flat())

// ---------- Piano 2 right hand (8vb chords, straight eighths) ----------
const CF = "[f#3,a3,c#4]*8"
const CD = "[d3,f#3,a3]*8"
const CA = [CF,CF,CD,CD,CF,CF,CD,CD]
const CB = ["[a3,c4,e4]*8","[ab3,c4,eb4]*8"]  // approximate
const rh2 = cat(...CA, ...Array(4).fill(CB).flat(), ...CA, ...Array(4).fill(CB).flat())

// ---------- Piano 2 left hand (low bass) ----------
const BF = "f#2@4 c#2@3 a1@9"
const BD = "a2@4 f#2@3 d2@9"
const BA = [BF,BF,BD,BD,BF,BF,BD,BD]
const BB = ["a1","ab1"]
const lh2 = cat(...BA, ...Array(4).fill(BB).flat(), ...BA, ...Array(4).fill(BB).flat())

stack(
  note(melody).s("piano").gain(0.9),
  note(lh1).s("piano").gain(0.7),
  note(rh2).s("piano").gain(0.5),
  note(lh2).s("piano").gain(0.7)
)
`