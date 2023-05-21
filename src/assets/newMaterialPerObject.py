import bpy
import math 
from math import sin, cos, pi
import random

i = 0
objects = bpy.data.collections['bod'].all_objects
for obj in objects:
    mat = bpy.data.materials.new(name="Material"+str(i))
    obj.data.materials.append(mat)
    i+=1
    
    