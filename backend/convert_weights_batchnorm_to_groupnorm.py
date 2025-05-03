import torch

def convert_batchnorm_to_groupnorm_state_dict(state_dict):
    """
    Convert a state_dict trained with BatchNorm3d layers to be compatible with GroupNorm layers.
    This removes BatchNorm parameters and keeps only Conv and GroupNorm parameters.
    """
    new_state_dict = {}
    for key, value in state_dict.items():
        # Skip BatchNorm parameters (weight, bias, running_mean, running_var)
        if "bn" in key or "batchnorm" in key or "running_mean" in key or "running_var" in key:
            continue
        # Rename keys if necessary (e.g., if GroupNorm layers have different naming)
        # Here we assume GroupNorm layers keep the same keys except BatchNorm keys are removed
        new_state_dict[key] = value
    return new_state_dict

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Convert BatchNorm3d weights to GroupNorm compatible weights")
    parser.add_argument("--input", required=True, help="Path to input model weights (BatchNorm)")
    parser.add_argument("--output", required=True, help="Path to save converted model weights")
    args = parser.parse_args()

    state_dict = torch.load(args.input, map_location="cpu")
    if "state_dict" in state_dict:
        state_dict = state_dict["state_dict"]

    new_state_dict = convert_batchnorm_to_groupnorm_state_dict(state_dict)

    torch.save(new_state_dict, args.output)
    print(f"Converted weights saved to {args.output}")

if __name__ == "__main__":
    main()
