def rotate_matrix(matrix):
    n = len(matrix)
    for i in range(n // 2):
        for j in range(i, n - i - 1):
            temp = matrix[i][j]
            matrix[i][j] = matrix[n - j - 1][i]
            matrix[n - j - 1][i] = matrix[n - i - 1][n - j - 1]
            matrix[n - i - 1][n - j - 1] = matrix[j][n - i - 1]
            matrix[j][n - i - 1] = temp

# Input and matrix reading
n = int(input())
matrix = []

for _ in range(n):
    matrix.append(list(map(int, input().split())))

# Rotate the matrix
rotate_matrix(matrix)

# Print the rotated matrix
for row in matrix:
    print(" ".join(map(str, row)))
