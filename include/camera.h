#ifndef CAMERA_H
#define CAMERA_H

#include <glad/glad.h>

#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <iostream>
#include <vector>

// Default camera values
const float ZOOM = 45.0f;

// An abstract camera class that processes input and calculates the
// corresponding Euler Angles, Vectors and Matrices for use in OpenGL
class Camera {
   public:
	// camera Attributes
	glm::vec3 Position;  // current position of the camera
	glm::vec3 Front;     // where the camera is pointing to
	glm::vec3 Up;        // camera's up axis
	glm::vec3 Right;    // camera's right axis (calculated by cros product of up
						// and direction)
	glm::vec3 WorldUp;  // up vector in our world
	// camera options
	float Zoom;

	// constructor with vectors
	// arguments - camera position, WorldUp vector, yaw, pitch
	Camera(glm::vec3 position = glm::vec3(0.0f, 0.0f, 0.0f),
		   glm::vec3 up = glm::vec3(0.0f, 1.0f, 0.0f))
		: Front(glm::vec3(0.0f, 0.0f, -1.0f)), Zoom(ZOOM) {
		Position = position;
		WorldUp = up;
		Up = glm::vec3(0.0f, 1.0f, 0.0f);
		Right = glm::cross(Front, Up);
	}

	// returns the view matrix calculated using Euler Angles and the LookAt
	// Matrix
	glm::mat4 GetViewMatrix(glm::vec3 target = glm::vec3(0.0f, 0.0f, 0.0f)) {
		// takes position, target, and cameraUp vector to return the view matrix
		// return glm::lookAt(Position, Position + Front, Up);
		return glm::lookAt(Position, target, Up);
	}
};
#endif
