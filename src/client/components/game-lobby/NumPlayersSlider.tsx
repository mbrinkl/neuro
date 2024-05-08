import { Slider } from "@mantine/core";

interface INumPlayersSliderProps {
  value: number;
  min: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
}

export const NumberPlayersSlider = (props: INumPlayersSliderProps) => {
  return (
    <div>
      <div>Num Players: {props.value}</div>
      {props.min !== props.max && (
        <Slider
          color="blue"
          value={props.value}
          onChange={props.onChange}
          min={props.min}
          max={props.max}
          marks={[
            {
              value: props.min,
              label: props.min,
            },
            {
              value: props.max,
              label: props.max,
            },
          ]}
          disabled={props.disabled}
        />
      )}
    </div>
  );
};
