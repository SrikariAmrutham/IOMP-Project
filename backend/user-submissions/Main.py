def generate(numRows):
    triangle = []

    for i in range(numRows):
        row = [1]  # First element is always 1

        for j in range(1, i):
            val = triangle[i - 1][j - 1] + triangle[i - 1][j]
            row.append(val)

        if i > 0:
            row.append(1)  # Last element is 1 for all rows except the first
        triangle.append(row)

    return triangle

if __name__ == "__main__":
    # Input Handling
    numRows = int(input())

    # Generate Pascal's Triangle
    result = generate(numRows)

    # Output
    print(result)
