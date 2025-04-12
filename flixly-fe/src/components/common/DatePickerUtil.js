import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const DatePickerUtil = ({ readDate, setReadDate }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
        marginTop: "10px",
        marginBottom: "10px",
      }}
    >
      <LocalizationProvider
        label={"Okuduğunuz Tarih"}
        sx={{ m: 2, minWidth: 120, marginTop: "10px" }}
        dateAdapter={AdapterDayjs}
      >
        <DatePicker
          value={readDate}
          onChange={(newValue) => setReadDate(newValue)}
        />
      </LocalizationProvider>
    </div>
  );
};
export default DatePickerUtil;
