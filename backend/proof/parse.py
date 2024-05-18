#-*- coding: utf-8 -*-
"""
This script parses the proof.json file and outputs the public inputs and proof in a format that can be used in the smart contract
"""
import ezkl
import json
onchain_input_array = []

proof = {}
with open("proof.json", 'r') as fp:
    proof = json.load(fp)

formatted_output = "["
for i, value in enumerate(proof["instances"]):
    for j, field_element in enumerate(value):
        onchain_input_array.append(ezkl.felt_to_big_endian(field_element))
        formatted_output += '"' + str(onchain_input_array[-1]) + '"'
        if j != len(value) - 1:
            formatted_output += ", "
    if i != len(proof["instances"]) - 1:
        formatted_output += ", "
formatted_output += "]"

print("pubInputs: ", formatted_output)
print("proof: ", proof["proof"])